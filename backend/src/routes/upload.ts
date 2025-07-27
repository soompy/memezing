import express from 'express';
import { uploadSingle } from '../middleware/upload';
import { uploadImageToCloudinary } from '../utils/cloudinary';

const router = express.Router();

router.post('/image', uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '이미지 파일이 필요합니다.',
      });
    }

    const result = await uploadImageToCloudinary(req.file.buffer, 'memezing/uploads');

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      },
      message: '이미지 업로드가 완료되었습니다.',
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: '이미지 업로드 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
});

router.post('/template', uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '템플릿 이미지 파일이 필요합니다.',
      });
    }

    const result = await uploadImageToCloudinary(req.file.buffer, 'memezing/templates');

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      },
      message: '템플릿 이미지 업로드가 완료되었습니다.',
    });
  } catch (error) {
    console.error('Template upload error:', error);
    res.status(500).json({
      success: false,
      message: '템플릿 업로드 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
});

export default router;