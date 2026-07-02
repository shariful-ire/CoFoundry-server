import Startup from '../models/Startup.js';
import User from '../models/User.js';

/* POST /api/startups — founder creates a startup (can create more than one) */
export async function createStartup(req, res) {
  try {
    const { startupName, industry, fundingStage, description, logo } = req.body;
    const founder = await User.findById(req.user.userId);

    const startup = await Startup.create({
      startupName, industry, fundingStage, description, logo,
      founderId:    req.user.userId,
      founderEmail: founder.email, // set server-side — never from body
    });
    res.status(201).json(startup);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* GET /api/startups/mine — all of the founder's own startups */
export async function getMyStartups(req, res) {
  try {
    const startups = await Startup.find({ founderId: req.user.userId }).sort({ createdAt: -1 });
    res.json(startups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* PUT /api/startups/:id */
export async function updateStartup(req, res) {
  try {
    const startup = await Startup.findOne({ _id: req.params.id, founderId: req.user.userId });
    if (!startup) return res.status(404).json({ message: 'Startup not found' });

    const { startupName, industry, fundingStage, description, logo } = req.body;
    Object.assign(startup, { startupName, industry, fundingStage, description, ...(logo && { logo }) });
    await startup.save();
    res.json(startup);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* DELETE /api/startups/:id */
export async function deleteStartup(req, res) {
  try {
    const startup = await Startup.findOneAndDelete({ _id: req.params.id, founderId: req.user.userId });
    if (!startup) return res.status(404).json({ message: 'Startup not found' });
    res.json({ message: 'Startup deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* GET /api/startups — public browse with pagination */
export async function getAllStartups(req, res) {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 9);
    const skip  = (page - 1) * limit;

    const filter = { status: 'approved' };
    if (req.query.industry)     filter.industry     = req.query.industry;
    if (req.query.fundingStage) filter.fundingStage = req.query.fundingStage;

    const [data, totalCount] = await Promise.all([
      Startup.find(filter).populate('founderId', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Startup.countDocuments(filter),
    ]);
    res.json({ data, totalCount, totalPages: Math.ceil(totalCount / limit), page });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* GET /api/startups/:id — public detail */
export async function getStartupById(req, res) {
  try {
    const startup = await Startup.findById(req.params.id).populate('founderId', 'name email');
    if (!startup) return res.status(404).json({ message: 'Startup not found' });
    res.json(startup);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
