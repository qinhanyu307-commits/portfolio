// Validate the whole batch before staging files; image optimization stays separate.
export function galleryFileKind(file){
 const extension=file.name.split('.').pop().toLowerCase();
 const videoType={mp4:'video/mp4',webm:'video/webm'}[extension];
 if(videoType&&(!file.type||file.type===videoType)){
  if(!file.size||file.size>50*1024*1024)throw Error('视频不能为空，且每个不能超过 50 MB。');
  return extension;
 }
 if(['image/jpeg','image/png','image/webp'].includes(file.type)){
  if(!file.size||file.size>20*1024*1024)throw Error('图片不能为空，且每张不能超过 20 MB。');
  return 'image';
 }
 throw Error('请选择 JPG、PNG、WebP 图片或 MP4、WebM 视频。');
}
export async function readGalleryVideo(file){
 const kind=galleryFileKind(file);if(kind==='image')throw Error('请选择视频。');
 const base64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(Error('视频读取失败，请重新选择。'));reader.readAsDataURL(file);});
 return {base64,url:URL.createObjectURL(file)};
}
