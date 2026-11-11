from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from pypdf import PdfReader
from pathlib import Path
import io
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF
out=Path('output/pdf/周明骏_技术美术简历_图标二维码版.pdf')
pdfmetrics.registerFont(TTFont('CN',r'C:\Windows\Fonts\msyh.ttc'))
pdfmetrics.registerFont(TTFont('CB',r'C:\Windows\Fonts\msyhbd.ttc'))
c=canvas.Canvas(str(out),pagesize=(595.28,841.89)); W,H=595.28,841.89
c.setTitle('周明骏 | 技术美术 / Unity 渲染'); c.setAuthor('周明骏 CEASIUM')
def text(x,y,s,size=9,bold=False,color='#242424'):
 c.setFillColor(color); c.setFont('CB' if bold else 'CN',size); c.drawString(x,H-y-size,s)
def line(x,y,x2,y2,width=.7):
 c.setStrokeColorRGB(.15,.15,.15); c.setLineWidth(width); c.line(x,H-y,x2,H-y2)
def wrap(s,width,size):
 rows=[]; r=''
 for ch in s:
  if pdfmetrics.stringWidth(r+ch,'CN',size)>width: rows.append(r);r=ch
  else:r+=ch
 if r:rows.append(r)
 return rows
def para(x,y,s,width,size=8.4,leading=13):
 for r in wrap(s,width,size): text(x,y,r,size);y+=leading
 return y
# structural rules
line(164,0,164,842,1.2); line(22,115,575,115,1.1)
img=PdfReader(r'C:\Users\72823\Desktop\周明骏CVe.pdf').pages[0].images[0]
c.drawImage(ImageReader(io.BytesIO(img.data)),22,H-104,width=62,height=86,mask='auto',preserveAspectRatio=True,anchor='c')
text(95,24,'个人网站',8.5,True)
qr=QrCodeWidget('https://ceasiumz.github.io',barLevel='M')
b=qr.getBounds(); size=55
d=Drawing(size,size,transform=[size/(b[2]-b[0]),0,0,size/(b[3]-b[1]),0,0]);d.add(qr)
renderPDF.draw(d,c,93,H-100)
c.linkURL('https://ceasiumz.github.io',(93,H-100,148,H-45),relative=0)
text(188,27,'周明骏',27,True);text(304,39,'CEASIUM',19,True)
text(189,72,'技术美术  /  Unity 渲染与场景特效',12,True)
text(189,96,'实时渲染 · Shader 开发 · 视觉表现 · 客户端实现',8.2)
# sidebar
text(23,137,'技术栈',14,True);line(23,161,143,161)
y=177
for title,body in [
 ('实时渲染','Unity / URP\nShaderLab / HLSL\nCG / GLSL / RenderDoc'),
 ('美术与特效','Blender / Houdini\nSubstance Painter\n粒子特效 / UV 动画'),
 ('编程开发','C# / C++\nPython / Lua\nTypeScript / JavaScript\nReact'),
 ('工程协作','Git / SVN\nMarkdown / Obsidian\n技术文档编写'),
 ('其他能力','剧本写作')]:
 text(23,y,title,9.5,True); y+=20
 for r in body.split('\n'):text(23,y,r,8.4);y+=15
 y+=18
text(23,613,'联系方式',13,True);line(23,638,143,638)
for y,s in [(653,'+86 158 6184 2082'),(674,'微信  ceasiumz'),(695,'ceasiumz@gmail.com')]:text(23,y,s,8.2)
text(23,731,'个人网站 / 作品入口',8.5,True)
text(23,750,'ceasiumz.github.io',8.4)
c.linkURL('https://ceasiumz.github.io',(23,H-764,147,H-748),relative=0)
text(23,781,'github.com/Ceasiumz',8.2)
c.linkURL('https://github.com/Ceasiumz',(23,H-795,147,H-780),relative=0)
# main
text(188,131,'教育经历',12,True);line(256,143,574,143)
text(188,157,'香港中文大学（深圳）',10,True);text(447,159,'2024.09 - 2028.05',8)
text(188,177,'工学学士（本科在读） | 主修计算机科学与技术 · 辅修经济学',8.2)
text(188,204,'项目经历',12,True);line(256,216,574,216)
y=230
projects=[
('VR 口腔场景与交互渲染','2026.02 - 2026.09','Freedom AI Lab · 王本友教授人机交互项目组 | Unity 开发 / 渲染',[
'基于真实口腔扫描模型构建 Unity 场景，完成 VR 显示与交互适配，为人机交互研究提供可运行的场景支持。',
'针对高精度口腔模型优化实时交互时的渲染效率，兼顾模型视觉细节与 VR 场景运行表现。']),
('AI 仪表盘与数据分析管理系统','2025.10 - 2026.01','ITSO（香港中文大学〔深圳〕）技术服务部 | React 前端开发',[
'参与日活跃用户 1K+ 的系统开发与迭代，负责 React 前端页面及功能实现，支持 AI 信息展示与数据分析管理。',
'实现 AI 会议纪要、多维表格数据分析等业务界面，将会议内容与结构化数据组织为可浏览、可操作的信息视图。']),
('潜水钟','2025.06 - 2026.09','海底灯塔小组 · 独立项目 | 技术美术（渲染）',[
'围绕恐怖题材的场景表现改造 Unity URP 渲染管线，构建 PBR 风格的材质与光照效果，服务整体氛围塑造。',
'编写 Shader 实现体积雾与法线混合等视觉效果；通过贴图尺寸控制、通道与 UV 整合、模型减面优化资产渲染开销。',
'项目内容获小红书万级收藏；开发已暂停，部分资产保密，可联系了解细节。']),
('东拼西凑','2025.03 - 2026.05','海底灯塔小组 · 独立项目 | 技术美术（渲染）',[
'基于 Unity URP 构建 Low-poly 卡通渲染表现，开发水体效果，涵盖程序化网格生成、水波、焦散、反射与高光。',
'制作漩涡等粒子特效与 UV 动画，补充水体及场景的动态表现；项目入围 CUSGA。']),
('Blueyes Artifact（奇华幻相）','2025.03 - 2026.05','卡牌游戏项目 | 特效 / 客户端开发',[
'负责伪 3D 卡牌特效与场景交互动效，将卡牌的空间层次与动态反馈接入客户端表现，参与视觉效果开发。',
'核心内测玩家 500+，多次参展深圳、上海游戏展；获 2025 腾讯游戏创作大赛 AI+ 赛道优秀作品。']),
('Game Jam 作品（卡牌类）','2025.03 - 2026.05','团队 / 个人项目 | 特效 / 客户端开发',[
'独立或主导完成游戏客户端开发，承担卡牌与场景的特效、动效制作，在限时开发中完成玩法与视觉表现的整合。',
'获 Unity Game Jam 优秀奖（前 20）、GGJ 深圳站点最佳视觉效果。'])]
def icon(kind,x,y):
 c.saveState();c.translate(x,H-y-14);c.setLineWidth(.8);c.setStrokeColorRGB(.16,.16,.16)
 if kind==0:
  c.roundRect(0,3,15,9,2,stroke=1,fill=0);c.circle(4,7.5,1.5,stroke=1,fill=0);c.circle(11,7.5,1.5,stroke=1,fill=0)
 elif kind==1:
  c.rect(0,1,15,12,stroke=1,fill=0);c.line(0,10,15,10)
  for xx,hh in [(3,3),(7,6),(11,4)]:c.line(xx,3,xx,hh+3)
 elif kind==2:
  c.arc(2,1,13,13,0,180);c.line(2,7,2,2);c.line(13,7,13,2);c.line(0,2,15,2);c.line(7.5,13,7.5,15)
 elif kind==3:
  for yy in [3,7,11]:
   path=c.beginPath();path.moveTo(0,yy);path.curveTo(4,yy+4,7,yy-4,11,yy);path.curveTo(13,yy+2,14,yy+2,16,yy);c.drawPath(path)
 elif kind==4:
  c.roundRect(1,0,10,14,1,stroke=1,fill=0);c.line(13,3,15,11);c.line(15,11,12,12);c.line(4,7,6,10);c.line(6,10,8,7);c.line(8,7,6,4);c.line(6,4,4,7)
 else:
  c.roundRect(0,2,16,10,3,stroke=1,fill=0);c.line(3,7,7,7);c.line(5,5,5,9);c.circle(11,6, .6,stroke=1,fill=0);c.circle(13,8,.6,stroke=1,fill=0)
 c.restoreState()
for idx,(title,date,role,bullets) in enumerate(projects):
 # corner ornament
 line(179,y+3,179,y+17);line(179,y+3,187,y+3)
 icon(idx,190,y-1)
 text(212,y,title,10,True);text(468,y+2,date,7.1)
 y+=19;text(190,y,role,7.6,color='#555555');y+=18
 for b in bullets:
  text(190,y,'·',8.5);y=para(201,y,b,366,8.1,12)+3
 y+=11
print('ending y',y)
assert y<833,y
c.save()
print(out.resolve())


