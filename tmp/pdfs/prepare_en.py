from pathlib import Path
s=Path('tmp/pdfs/build_cv.py').read_text(encoding='utf-8-sig')
pre=s[:s.index('# structural rules')]
pre=pre.replace("周明骏_技术美术简历_图标二维码版.pdf","Mingjun_Zhou_TA_Resume_EN_261015.pdf")
pre=pre.replace("'CB' if bold else 'CN'","'Helvetica-Bold' if bold else 'Helvetica'")
start=pre.index('def wrap(');end=pre.index('def para(')
pre=pre[:start]+'''def wrap(s,width,size):
 rows=[]; r=''
 for word in s.split():
  trial=(r+' '+word).strip()
  if pdfmetrics.stringWidth(trial,'Helvetica',size)>width and r:rows.append(r);r=word
  else:r=trial
 if r:rows.append(r)
 return rows
'''+pre[end:]
icons=s[s.index('def icon('):s.index('for idx,')]
body='''
line(167,0,167,842,1.15);line(24,115,578,115,1.1)
imgs=PdfReader(r'C:\\Users\\72823\\Downloads\\周明骏_TA简历_261015.pdf.pdf').pages[0].images
c.drawImage(ImageReader(io.BytesIO(imgs[0].data)),22,H-103,62,83)
text(95,24,'WEBSITE',8)
text(188,28,'MINGJUN ZHOU',23)
text(188,61,'CEASIUM',12,color='#555555')
text(188,83,'Technical Artist / Unity Rendering & Scene VFX',10.5)
text(188,101,'Real-time Rendering  /  Shaders  /  Visual Effects  /  Client Development',7.2)
text(23,138,'TECHNICAL SKILLS',11);line(23,161,143,161)
y=178
for title,rows in [
 ('Real-time Rendering',['Unity / URP','ShaderLab / HLSL','CG / GLSL / RenderDoc']),
 ('Art & VFX',['Blender / Houdini','Substance Painter','Particles / UV Animation']),
 ('Programming',['C# / C++','Python / Lua','TypeScript / JavaScript','React']),
 ('Collaboration',['Git / SVN','Obsidian / Notion','Technical Documentation']),
 ('Other',['Scriptwriting'])]:
 text(23,y,title,9);y+=19
 for row in rows:text(23,y,row,8.1);y+=15
 y+=18
text(23,614,'CONTACT',11);line(23,638,143,638)
for yy,row in [(653,'+86 158 6184 2082'),(674,'WeChat: ceasiumz'),(695,'ceasiumz@gmail.com')]:text(23,yy,row,8.2)
text(23,732,'WEBSITE / PORTFOLIO',8)
text(23,747,'ceasiumz.github.io',8.2)
c.drawImage(ImageReader(io.BytesIO(imgs[2].data)),35,H-801,37,37,mask='auto')
c.linkURL('https://ceasiumz.github.io',(23,H-802,145,H-744),relative=0)
text(23,812,'github.com/Ceasiumz',8)
c.linkURL('https://github.com/Ceasiumz',(23,H-825,145,H-811),relative=0)
text(183,128,'EDUCATION',11);line(272,140,573,140)
text(202,148,'The Chinese University of Hong Kong, Shenzhen',9)
c.drawImage(ImageReader(io.BytesIO(imgs[1].data)),184,H-193,28,20,mask='auto')
text(221,166,'Bachelor of Engineering (in progress)',8)
text(465,165,'Sep 2024 - May 2028',7)
text(221,182,'Major: Computer Science and Technology',8)
text(221,196,'Minor: Economics',8)
text(188,214,'PROJECT EXPERIENCE',11);line(325,226,574,226)
y=238
projects=[
('VR Interaction & Rendering','Feb 2026 - Sep 2026','Freedom AI Lab | Prof. Benyou Wang, HCI Group | Unity Development / Rendering',[
'Built Unity scenes from real oral scan models and adapted them for VR display and interaction, providing working environments for human-computer interaction research.',
'Optimized real-time rendering of high-resolution oral models, balancing visual detail with runtime performance during VR interaction.']),
('AI Dashboard Development','Oct 2025 - Jan 2026','ITSO, CUHK-Shenzhen | Technical Services | React Front-end Development',[
'Developed and iterated on a system serving 1K+ daily active users, implementing React interfaces and features for AI information display and data analysis management.',
'Built interfaces for AI meeting minutes and multidimensional table analysis, organizing meeting content and structured data into browsable, actionable views.']),
('PBR Rendering | Diving Bell','Jun 2025 - Sep 2026','Undersea Lighthouse Team | Independent Project | Technical Artist (Rendering)',[
'Customized Unity URP for horror environments, developing PBR materials and lighting to support the visual atmosphere.',
'Implemented volumetric fog and normal blending in shaders; reduced asset rendering costs through texture resizing, channel packing, UV consolidation and mesh reduction.',
'Project content received 10K+ saves on Xiaohongshu. Development is paused; some assets are confidential. Further details available on request.']),
('Stylized Toon Rendering | Dong Pin Xi Cou','Mar 2025 - May 2026','Undersea Lighthouse Team | Independent Project | Technical Artist (Rendering)',[
'Developed a low-poly toon rendering style in Unity URP and water effects covering procedural mesh generation, waves, caustics, reflections and specular highlights.',
'Created whirlpool particle effects and UV animations for water and environment motion. The project was shortlisted for CUSGA.']),
('Client Development | Blueyes Artifact','Mar 2025 - May 2026','Card Game Project | VFX / Client Development',[
'Created pseudo-3D card effects and interactive scene animations, integrating spatial depth and animated feedback into the game client.',
'Reached 500+ core closed-test players and exhibited in Shenzhen and Shanghai. Received an Outstanding Work award in the AI+ track of the 2025 Tencent Game Creation Competition.']),
('Game Jam Projects | Card Games','Mar 2025 - May 2026','Team / Individual Projects | VFX / Client Development',[
'Independently developed or led game client implementation, creating card and scene effects and animations to integrate gameplay and visuals within jam deadlines.',
'Awards: Unity Game Jam Excellence Award (Top 20); Best Visual Effects at the Global Game Jam Shenzhen site.'])]
'''
post='''
for idx,(title,date,role,bullets) in enumerate(projects):
 line(179,y+3,179,y+17);line(179,y+3,187,y+3)
 icon(idx,190,y-1)
 text(212,y,title,9.1);text(474,y+2,date,6.6)
 y+=19;text(190,y,role,6.8,color='#555555');y+=17
 for b in bullets:
  text(190,y,'·',8.5);y=para(201,y,b,367,8.05,11)+3
 y+=12
print('ending y',y)
assert y<834,y
c.save()
print(out.resolve())
'''
Path('tmp/pdfs/build_en.py').write_text(pre+icons+body+post,encoding='utf-8')
