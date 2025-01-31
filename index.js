import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import FTP from 'basic-ftp'
import { fileURLToPath } from 'url'
import multer from 'multer'
import fs from 'fs'
dotenv.config()
const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const folderpath=path.join(__dirname,'uploads/')
if (!fs.existsSync(folderpath)) {
      fs.mkdirSync(folderpath)
}
const config = {
    user: `${process.env.USER}`,
    host: `${process.env.HOST}`,
    password: `${process.env.PASSWORD}`
}
const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        
        cb(null, file.originalname)
    },
    destination: (req, file, cb) => {
        cb(null, folderpath)
    }
})

const upload = multer({ storage })

app.post('/addfile', upload.single('file'), async (req, res) => {
    const client = new FTP.Client()
    await client.access(config)
    const localfilepath = path.join(folderpath, req.file.filename)
    const remotefilepath = `/files/${req.file.filename}`
    await client.uploadFrom(localfilepath, remotefilepath)

    fs.unlinkSync(localfilepath)
    client.close()
    return res.status(200).json({ message: 'File uploaded to ftp server successfully' })
})

app.get('/showfiles',async(req,res)=>{
    const client=new FTP.Client()
    await client.access(config)
    const data=await client.list('/files')
    // const localfilepath=path.join(folderpath,req.file.originalname)
    // for (const file of data) {
    //     await client.downloadTo(localfilepath,path.join('files/',file))
    // }
//    fs.unlinkSync(localfilepath)
   client.close()
   return res.status(200).json({file:data})
})

app.listen(4000)