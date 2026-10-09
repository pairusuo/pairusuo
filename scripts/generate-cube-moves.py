"""Render each move as an individual diagram, for responsive step-by-step reading."""
from cube_geometry import *
from pathlib import Path
from html import escape
import json
OUT=Path('public/images/rubiks-cube');OUT.mkdir(exist_ok=True)
colors={'U':'#facc15','D':'#fff','F':'#22c55e','R':'#ef4444','L':'#3b82f6','B':'#fb923c'}
labels={'U':'黄','D':'白','F':'绿','R':'红','L':'蓝','B':'橙'}
manifest={}
def project(p):
 x,y,z=p;return (320+0.9*(70*x-49*z),250+0.78*(-77*y+27*x+36*z))
def draw(c,name,title,note,highlight=None):
 out=[f'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="520" viewBox="0 0 640 520" role="img" aria-labelledby="title"><title id="title">{escape(title)}</title><rect width="640" height="520" rx="16" fill="#f8fafc"/><g font-family="system-ui,PingFang SC,Microsoft YaHei,sans-serif">',f'<text x="320" y="42" font-size="26" text-anchor="middle" fill="#172033">{escape(title)}</text>']
 for f in ['U','F','R']:
  n=N[f];a=next(i for i,v in enumerate(n) if v);axes=[i for i in range(3) if i!=a]
  for p,normal,color in c:
   if normal!=n:continue
   points=[]
   for d,e in [(-.46,-.46),(.46,-.46),(.46,.46),(-.46,.46)]:
    v=list(p);v[a]=1.5;v[axes[0]]+=d;v[axes[1]]+=e;points.append(project(v))
   stroke='#7c3aed' if highlight==p else '#172033';sw=5 if highlight==p else 2
   out.append(f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x,y in points)}" fill="{colors[color]}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"/>')
   v=list(p);v[a]=1.5;x,y=project(v)
   out.append(f'<text x="{x:.1f}" y="{y+6:.1f}" font-size="17" text-anchor="middle" fill="#172033">{labels[color]}</text>')
 arrows={'R':(535,340,535,180),"R′":(535,180,535,340),'L′':(105,340,105,180),'L':(105,180,105,340),'U':(405,90,235,90),'U′':(235,90,405,90)}
 if name.startswith(('right-','left-')) and name[-1]!='0':
  move=(A if name.startswith('right') else B).split()[int(name[-1])-1].replace("'",'′'); x1,y1,x2,y2=arrows[move]
  out.append(f'<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 Z" fill="#7c3aed"/></marker></defs><path d="M{x1},{y1} L{x2},{y2}" fill="none" stroke="#7c3aed" stroke-width="5" marker-end="url(#arrow)"/>')
 out.extend([f'<text x="320" y="470" font-size="22" text-anchor="middle" fill="#172033">{escape(note)}</text>','</g></svg>'])
 (OUT/('move-'+name+'.svg')).write_text(''.join(out));manifest[name]={'title':title,'note':note}
def seq(prefix,c,moves,titles,notes,highlight=None):
 draw(c,prefix+'-0',titles[0],notes[0],highlight)
 for i,m in enumerate(moves):run(c,m);draw(c,prefix+f'-{i+1}',titles[i+1],notes[i+1],(1,-1,1) if prefix=='corner' else highlight)
# Each diagram is the exact resulting state, not a decorative cube.
seq('right',solved(),A.split(),['起点：认准正面','① 上：右层向上','② 去：顶层向左','③ 下：右层向下','④ 回：顶层向右'],['绿心朝前，红心在右']+['整颗魔方拿法保持不变']*3+['四步合起来，才算“右手一次”'])
seq('left',solved(),B.split(),['起点：左手镜像动作','① 上：左层向上','② 去：顶层向右','③ 下：左层向下','④ 回：顶层向左'],['仍然绿心朝前，红心在右']+['只转指定层，保持正面不变']*3+['四步合起来，才算“左手一次”'])
for side,seqs in [('right',['U',A,'y',B]),('left',["U'",B,"y'",A])]:
 c=run(solved(),inv(' '.join(seqs)+' '+inv(seqs[2])));endfront=face(c,'F')[4]
 seq('middle-'+side,c,seqs,['① 起点：棱块侧色对中心','② 顶层先远离目标槽','③ 完整做一次'+('右手' if side=='right' else '左手'),'④ 整颗转向，换一个正面','⑤ 另一只手做一次，复原'],['绿心朝前：目标棱在正前上方','只转顶层 90°','白色角暂时离开底层','原来的'+('右面' if side=='right' else '左面')+'成为新正面','白色角与目标棱一起归位'])
seq('cross',run(solved(),inv('F '+A+" F'")),['F',A,"F'"],['① 黄色横线左右放平','② 前面顺时针转 90°','③ 完整做右手一次','④ 前面逆时针转回'],['俯视时，黄色棱连成横线','只转前面，不是整颗转动','上 → 去 → 下 → 回','黄色十字出现，下面两层恢复'])
# Flip and fixed work corner, exposed by looking slightly upward instead.
c=run(solved(),(' '+A)*3+' y '+(' '+B)*3+' x2');draw(c,'yellow-work','黄色朝下：固定右前下角','紫色框是唯一工作角；下一角靠转底层送来',(1,-1,1))
c=solved();draw(c,'regrip-before','整颗转向之前','正面绿心，右面红心');run(c,'y');draw(c,'regrip-after','整颗转向之后','原来的右面变正面：现在红心朝前')
Path('scripts/cube-moves-index.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
seq('corner',run(solved(),inv(A)),[A],['白角放到右前上方','右手做一整次后'],['紫框里的角，在目标位置正上方','白角归位后，同时检查两个侧色'],(1,1,1))
E=B+' '+A+(' '+B)*5+(' '+A)*5
Er=A+' '+B+(' '+A)*5+(' '+B)*5
for side,formula in [('left',E),('right',Er)]:
 c=run(solved(),inv(formula));draw(c,'last-'+side,'完整的绿色面朝前','后面缺橙色，橙色在'+('左' if side=='left' else '右')+'边')
draw(solved(),'solved','最后检查：六面分别同色','白底、黄顶；侧面每一层都与中心同色')
Path('scripts/cube-moves-index.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
