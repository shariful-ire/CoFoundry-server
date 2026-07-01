import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema({
  startupId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
  founderEmail:    { type: String, required: true, lowercase: true }, // set server-side from session
  industry:        { type: String, required: true }, // denormalized from the startup, for filtering
  roleTitle:       { type: String, required: true, trim: true, minlength: 3 },
  requiredSkills:  [{ type: String }],
  workType:        { type: String, enum: ['Remote', 'Hybrid', 'On-site'], required: true },
  commitmentLevel: { type: String, enum: ['Full-time', 'Part-time'], required: true },
  deadline:        { type: Date, required: true },
  applicantCount:  { type: Number, default: 0 },
}, { timestamps: true });

opportunitySchema.index({ roleTitle: 1 });
opportunitySchema.index({ requiredSkills: 1 });
opportunitySchema.index({ workType: 1 });
opportunitySchema.index({ industry: 1 });

export default mongoose.model('Opportunity', opportunitySchema);
