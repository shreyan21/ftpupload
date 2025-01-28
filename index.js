import express from "express"
import multer from "multer"
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { Client } from "basic-ftp"
import { fileURLToPath } from "url"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config()
const app = express()
const ftp_config = {
  host: '160.25.62.184',
  user: 'docadmin',
  password: `${process.env.PASSWORD}`
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname,'uploads'))
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})
const dirPath=path.join(__dirname,'uploads')
if(!fs.existsSync(dirPath)){
  fs.mkdirSync(dirPath)
}

const upload = multer({ storage })

app.post('/addfile', upload.single('file'), async (req, res) => {
  try {
    const client = new Client()
    await client.access(ftp_config)
    const localfilepath = path.join(__dirname, 'uploads', req.file.filename)
    const remotefilepath = `/files/${req.file.originalname}`
    await client.uploadFrom(localfilepath, remotefilepath)
    fs.unlinkSync(localfilepath)
    client.close()
    return res.status(200).json({message:'File send succesfully'})
  }
  catch (e) {
    return res.status(500).json({message:e})

  }


})



app.get('/showfile/:filename',async(req,res)=>{
  try{
        const client=new Client()
        await client.access(ftp_config)
        const localfilepath=path.join(__dirname,'public',req.params.filename)
        const remotefilepath=path.join(`files/${req.params.filename}`)
        await client.downloadTo(localfilepath,remotefilepath)
         client.close()
        res.status(200).sendFile(localfilepath)
        res.on('finish',()=>{
          fs.unlinkSync(localfilepath)
          console.log('File successfully deleted');
          
        })
  }
  catch(e){
  return res.status(500).json({message:e})
  }
})
app.listen(4000,()=>{
  console.log(`Server listening on port 4000`);
  
})
