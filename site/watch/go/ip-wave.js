(() => {
 const part=document.getElementById('part-6'),art=part?.querySelector('img');if(!art)return;
 const left=1490,top=45,width=420,height=410;
 async function mount(){
  await art.decode();if(part.querySelector('.ip-wave-stage'))return;
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true});if(!gl)return;
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
  const program=gl.createProgram();
  gl.attachShader(program,shader(gl.VERTEX_SHADER,`attribute vec2 position;varying vec2 uv;void main(){uv=(position+1.)*.5;gl_Position=vec4(position,0.,1.);}`));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`
   precision highp float;varying vec2 uv;uniform sampler2D artwork;uniform float time;
   vec2 turn(vec2 p,vec2 pivot,float angle){float s=sin(angle),c=cos(angle);p-=pivot;return pivot+mat2(c,s,-s,c)*p;}
   void main(){
    vec2 p=vec2(1490.,45.)+vec2(uv.x,1.-uv.y)*vec2(420.,410.);
    // Move the whole body rigidly; a spatial falloff here stretches the face and torso.
    float wave=sin(time*3.49066);
    vec2 q=turn(p,vec2(1720.,390.),sin(time*1.74533)*.036);
    q.y-=sin(time*1.74533+.4)*3.84;
    // Bend only the raised arm back to its shoulder, with no separate wrist layer.
    // The arm influence is exactly zero across the face and main body.
    float arm=(1.-smoothstep(1580.,1610.,q.x))*(1.-smoothstep(195.,250.,q.y));
    q=turn(q,vec2(1578.,248.),wave*.13*arm);
    // Pin the original frosted panel's straight and curved boundaries in place.
    float edge=p.x<1668.?abs(p.y-295.):p.y<395.?abs(length(p-vec2(1668.,395.))-100.):abs(p.x-1768.);
    float pin=smoothstep(2.,24.,edge);
    // Also pin the outside of the patch so it joins the original artwork seamlessly.
    vec2 inset=min(p-vec2(1490.,45.),vec2(1910.,455.)-p);
    float border=smoothstep(0.,20.,min(inset.x,inset.y));
    q=mix(p,q,pin*border);
    gl_FragColor=texture2D(artwork,(q-vec2(1490.,45.))/vec2(420.,410.));
   }`));
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const source=document.createElement('canvas');source.width=width;source.height=height;source.getContext('2d').drawImage(art,left,top,width,height,0,0,width,height);
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);
  const stage=document.createElement('div');stage.className='ip-wave-stage';stage.style.top=top/art.naturalHeight*100+'%';stage.setAttribute('role','img');stage.setAttribute('aria-label','粉色 IP 自然挥手，身体轻轻晃动，前方毛玻璃持续保留');stage.append(canvas);
  const time=gl.getUniformLocation(program,'time');let visible=false,frame=0,start=performance.now();const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const draw=now=>{gl.uniform1f(time,reduced.matches?0:(now-start)/1000);gl.drawArrays(gl.TRIANGLES,0,6);if(visible&&!document.hidden&&!reduced.matches)frame=requestAnimationFrame(draw);};
  const update=()=>{cancelAnimationFrame(frame);stage.classList.toggle('is-waving',visible&&!document.hidden&&!reduced.matches);draw(performance.now());};
  draw(start);part.classList.add('has-ip-wave');part.append(stage);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();},{rootMargin:'100px'}).observe(stage);document.addEventListener('visibilitychange',update);reduced.addEventListener('change',update);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);stage.remove();});
 }
 const ready=new IntersectionObserver(entries=>{if(!entries.some(entry=>entry.isIntersecting))return;ready.disconnect();mount().catch(()=>{});},{rootMargin:'1200px'});ready.observe(part);
})();
