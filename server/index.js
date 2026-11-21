import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { advisory } from './advisory.js';

const app = express();
app.use(helmet({contentSecurityPolicy:{directives:{'script-src':["'self'",'https://cdn.jsdelivr.net'],'img-src':["'self'",'data:','https:']}}}));
app.use(express.json({ limit: '100kb' }));
const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32 || secret.startsWith('replace-')) throw new Error('Set a random JWT_SECRET of at least 32 characters');
if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI');
const User = mongoose.model('User', new mongoose.Schema({ name: String, email: { type: String, unique: true }, password: String }));
const Farm = mongoose.model('Farm', new mongoose.Schema({ owner: { type: mongoose.Schema.Types.ObjectId, unique: true }, land: Number, crops: Number, yield: Number, revenue: Number }, { timestamps: true }));
const Record = mongoose.model('Record', new mongoose.Schema({ owner: mongoose.Schema.Types.ObjectId, type: String, title: String, notes: String, date: String, done: { type: Boolean, default: false } }, { timestamps: true }));
const Schedule = mongoose.model('Schedule',new mongoose.Schema({owner:{type:mongoose.Schema.Types.ObjectId,unique:true},tasks:Array,events:mongoose.Schema.Types.Mixed},{timestamps:true}));
const clean = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 }));
app.get('/api/places',rateLimit({windowMs:60000,limit:30}),async(req,res)=>{const q=String(req.query.q||'').trim();if(q.length<3||q.length>100)return res.json([]);try{const params=new URLSearchParams({q,limit:'8',appid:process.env.WEATHER_API_KEY||''});const r=await fetch('https://api.openweathermap.org/geo/1.0/direct?'+params,{signal:AbortSignal.timeout(8000)});res.json(r.ok?await r.json():[]);}catch{res.json([]);}});
app.post('/api/auth/:action', async (req, res) => {
  const email = clean(req.body.email, 254).toLowerCase();
  const password = req.body.password;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== 'string' || password.length < 10 || Buffer.byteLength(password) > 72) return res.status(400).json({ error: 'Use a valid email and a password of 10–72 bytes.' });
  let user;
  if (req.params.action === 'register') {
    const name = clean(req.body.name, 100);
    if (!name) return res.status(400).json({ error: 'Name is required' });
    try { user = await User.create({ name, email, password: await bcrypt.hash(password, 12) }); }
    catch (e) { if (e.code === 11000) return res.status(409).json({ error: 'Account already exists' }); throw e; }
  } else if (req.params.action === 'login') {
    user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) return res.status(401).json({ error: 'Invalid email or password' });
  } else return res.sendStatus(404);
  const token = jwt.sign({ sub: String(user._id) }, secret, { expiresIn: '8h' });
  res.setHeader('Set-Cookie', `session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
  res.json({ name: user.name });
});
app.post('/api/logout', (req, res) => { res.setHeader('Set-Cookie', 'session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'); res.json({ ok: true }); });
app.get('/api/health', (req, res) => res.json({ database: mongoose.connection.readyState === 1 ? 'connected' : 'unavailable' }));
app.use('/api', (req, res, next) => {
  try { const token = req.headers.cookie?.split('; ').find(c => c.startsWith('session='))?.slice(8); req.owner = jwt.verify(token, secret).sub; next(); }
  catch { res.status(401).json({ error: 'Please sign in' }); }
});
app.use('/api', advisory);
app.get('/api/schedule',async(req,res)=>res.json(await Schedule.findOne({owner:req.owner})||{tasks:[],events:{}}));
app.put('/api/schedule',async(req,res)=>{
 const {tasks,events}=req.body;
 if(!Array.isArray(tasks)||tasks.length>100||!events||typeof events!=='object'||Array.isArray(events)||Object.keys(events).length>2000)return res.status(400).json({error:'Invalid schedule'});
 if(tasks.some(t=>!t||typeof t.crop!=='string'||t.crop.length>100))return res.status(400).json({error:'Invalid crop task'});
 for(const [date,rows] of Object.entries(events)){if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Array.isArray(rows)||rows.length>100||rows.some(r=>!r||!['water','fertilizer','harvest'].includes(r.type)||typeof r.label!=='string'||r.label.length>300))return res.status(400).json({error:'Invalid schedule event'});}
 res.json(await Schedule.findOneAndUpdate({owner:req.owner},{tasks,events},{upsert:true,new:true}));
});
app.get('/api/me', async (req, res) => { const user = await User.findById(req.owner); if (!user) return res.sendStatus(401); res.json({ name: user.name }); });
app.get('/api/farm', async (req, res) => res.json(await Farm.findOne({ owner: req.owner }) || {}));
app.put('/api/farm', async (req, res) => {
  const values = {};
  for (const key of ['land','crops','yield','revenue']) { const value = req.body[key]; if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || (key === 'crops' && !Number.isInteger(value))) return res.status(400).json({ error: 'Farm values must be nonnegative; crops must be a whole number.' }); values[key] = value; }
  res.json(await Farm.findOneAndUpdate({ owner: req.owner }, values, { upsert: true, new: true }));
});
app.get('/api/records', async (req, res) => res.json(await Record.find({ owner: req.owner }).sort({ date: -1 }).limit(500)));
app.post('/api/records', async (req, res) => {
  const { type, date } = req.body; const title = clean(req.body.title, 150), notes = clean(req.body.notes, 3000);
  if (!['task','soil','crop','application'].includes(type) || !title || !/^\d{4}-\d{2}-\d{2}$/.test(date || '') || Number.isNaN(Date.parse(date))) return res.status(400).json({ error: 'Choose a record type, title and valid date' });
  res.status(201).json(await Record.create({ owner: req.owner, type, date, title, notes }));
});
app.patch('/api/records/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id) || typeof req.body.done !== 'boolean') return res.sendStatus(400);
  const row = await Record.findOneAndUpdate({ _id: req.params.id, owner: req.owner }, { done: req.body.done }, { new: true });
  if (!row) return res.sendStatus(404); res.json(row);
});
app.use('/api', (req, res) => res.status(404).json({ error: 'API route not found' }));
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
app.use(express.static(dist));
app.get('/{*path}', (req, res) => res.sendFile(path.join(dist, 'index.html')));
app.use((err, req, res, next) => { console.error(err.message); res.status(500).json({ error: 'Request failed. Please try again.' }); });
await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
app.listen(process.env.PORT || 3001, () => console.log('AgroEase API ready'));
