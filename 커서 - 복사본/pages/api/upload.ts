import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

// @ts-ignore
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new IncomingForm({
    multiples: true,
    maxFiles: 10,
    uploadDir,
    keepExtensions: true,
    filename: (name: string, ext: string, part: any, form: any) => {
      const safeName = part.originalFilename
        ? part.originalFilename.replace(/[^a-zA-Z0-9.\-_]/g, '')
        : 'file';
      return `${Date.now()}-${safeName}`;
    },
  });

  form.parse(req, (err: any, fields: any, files: any) => {
    if (err) {
      res.status(500).json({ error: '업로드 실패', detail: err.message });
      return;
    }
    const fileArr = Array.isArray(files.files) ? files.files : [files.files];
    const urls = fileArr
      .filter((f: any) => f && f.newFilename)
      .map((f: any) => `/uploads/${f.newFilename}`);
    if (urls.length === 0) {
      res.status(400).json({ error: '업로드된 파일이 없습니다.' });
      return;
    }
    res.status(200).json({ success: true, urls });
  });
} 