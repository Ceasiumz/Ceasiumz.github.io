from pathlib import Path
p=Path('tmp/pdfs/build_cv.py')
s=p.read_text(encoding='utf-8-sig')
s=s.replace('import io','import io\nfrom reportlab.graphics.barcode.qr import QrCodeWidget\nfrom reportlab.graphics.shapes import Drawing\nfrom reportlab.graphics import renderPDF')
s=s.replace("text(95,30,'CEASIUM',8.5,True);text(95,49,'PORTFOLIO',6.4)\ntext(95,65,'渲染 / 图形',7.2);text(95,80,'程序 / 视觉',7.2)","""text(95,24,'个人网站',8.5,True)
qr=QrCodeWidget('https://ceasiumz.github.io',barLevel='M')
b=qr.getBounds(); size=55
d=Drawing(size,size,transform=[size/(b[2]-b[0]),0,0,size/(b[3]-b[1]),0,0]);d.add(qr)
renderPDF.draw(d,c,93,H-100)
c.linkURL('https://ceasiumz.github.io',(93,H-100,148,H-45),relative=0)""")
s=s.replace('for title,date,role,bullets in projects:', '''def icon(kind,x,y):
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
for idx,(title,date,role,bullets) in enumerate(projects):''')
s=s.replace("text(190,y,title,10,True);text(468,y+2,date,7.1)","icon(idx,190,y-1)\n text(212,y,title,10,True);text(468,y+2,date,7.1)")
p.write_text(s,encoding='utf-8')
