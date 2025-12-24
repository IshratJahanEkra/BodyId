import Record from '../models/Record.js';
import User from '../models/User.js';
import { uploadToCloudinary } from '../utils/upload.js';

export async function uploadRecord(req, res) {
  try {
    // req.user populated by auth middleware
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // optional fields
    const { title, description, tags } = req.body;
    const folder = `bodyid/${req.user.bodyId}/records`;

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file.buffer, folder);

    // Save to MongoDB
    const rec = new Record({
      patientId: req.user._id,
      title: title || 'Untitled Record',
      description: description || '',
      fileUrl: result.secure_url,
      filePublicId: result.public_id,
      fileType: file.mimetype,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
    });

    await rec.save();

    return res.status(201).json({
      message: 'Record uploaded successfully',
      record: rec,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({
      message: 'Failed to upload record',
      error: error.message,
    });
  }
}

/**
 * @desc Get all records of logged-in user
 * @route GET /api/records
 * @access Private
 */
export async function getRecords(req, res) {
  try {
    const userId = req.user.id;
    const records = await Record.find({ patientId: userId }).sort({
      createdAt: -1,
    });
    if (!records || records.length === 0) {
      return res
        .status(404)
        .json({ message: 'No records found for this user' });
    }

    res.status(200).json({
      message: 'Records fetched successfully',
      count: records.length,
      records,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch records',
      error: error.message,
    });
  }
}

/**
 * @desc Get records shared with the logged-in doctor
 * @route GET /api/records/shared
 * @access Private
 */
export async function getSharedRecords(req, res) {
  try {
    const userId = req.user.id;
    const { patientId } = req.query;

    const query = { sharedWith: userId };
    if (patientId) {
      query.patientId = patientId;
    }

    const records = await Record.find(query)
      .populate('patientId', 'name email nid bmdcId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Shared records fetched successfully',
      count: records.length,
      records,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch shared records',
      error: error.message,
    });
  }
}

/**
 * @desc Get a single record by ID (only if belongs to logged-in user)
 * @route GET /api/records/:recordId
 * @access Private
 */
export async function getRecord(req, res) {
  try {
    const { recordId } = req.params;
    const userId = req.user.id;

    const record = await Record.findById(recordId).populate(
      'sharedWith',
      'name bmdcId email'
    );

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Check if user is owner OR has permission
    const isOwner = record.patientId.toString() === userId;
    const isShared = record.sharedWith && record.sharedWith.includes(userId);

    if (!isOwner && !isShared) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({
      message: 'Record fetched successfully',
      record,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch record',
      error: error.message,
    });
  }
}

/**
 * @desc Delete a record by ID (only if belongs to logged-in user)
 * @route DELETE /api/records/:recordId
 * @access Private
 */
export async function deleteRecord(req, res) {
  try {
    const { recordId } = req.params;
    const userId = req.user.id;

    const record = await Record.findOne({ _id: recordId, patientId: userId });

    if (!record) {
      return res
        .status(404)
        .json({ message: 'Record not found or not accessible' });
    }

    await Record.findByIdAndDelete(recordId);

    res.status(200).json({
      message: 'Record deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to delete record',
      error: error.message,
    });
  }
}

/**
 * @desc Share a record with a doctor
 * @route POST /api/records/:recordId/share
 * @access Private
 */
export async function shareRecord(req, res) {
  try {
    const { recordId } = req.params;
    const { doctorBmdcId } = req.body;
    const userId = req.user.id;

    const record = await Record.findOne({ _id: recordId, patientId: userId });
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    const doctor = await User.findOne({ bmdcId: doctorBmdcId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found with this BMDC ID' });
    }

    if (record.sharedWith.includes(doctor._id)) {
      return res.status(400).json({ message: 'Record already shared with this doctor' });
    }

    record.sharedWith.push(doctor._id);
    await record.save();

    res.status(200).json({
      message: 'Record shared successfully',
      sharedWith: await User.find({ _id: { $in: record.sharedWith } }).select('name nid bmdcId email specialty'),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to share record', error: error.message });
  }
}

/**
 * @desc Unshare a record with a doctor
 * @route DELETE /api/records/:recordId/share/:doctorBmdcId
 * @access Private
 */
export async function unshareRecord(req, res) {
  try {
    const { recordId, doctorBmdcId } = req.params;
    const userId = req.user.id;

    const record = await Record.findOne({ _id: recordId, patientId: userId });
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    const doctor = await User.findOne({ bmdcId: doctorBmdcId });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    record.sharedWith = record.sharedWith.filter(
      (id) => id.toString() !== doctor._id.toString()
    );
    await record.save();

    res.status(200).json({
      message: 'Access revoked successfully',
      sharedWith: await User.find({ _id: { $in: record.sharedWith } }).select('name nid bmdcId email specialty'),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unshare record', error: error.message });
  }
}
