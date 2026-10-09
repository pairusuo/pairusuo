"""Generate the original, scalable diagrams used by the cube tutorial."""
from pathlib import Path
from html import escape
OUT=Path('public/images/rubiks-cube')
COLORS={'Y':'#facc15','W':'#fff','G':'#22c55e','B':'#3b82f6','R':'#ef4444','O':'#fb923c','?':'#e2e8f0'}
LABEL={'Y':'黄','W':'白','G':'绿','B':'蓝','R':'红','O':'橙','?':''}
def txt(x,y,s,size=22): return f'<text x="{x}" y="{y}" text-anchor="middle" font-size="{size}" fill="#172033">{escape(s)}</text>'
def grid(x,y,s,mark=None):
 out=''
 for i,c in enumerate(s):
  xx=x+i%3*49; yy=y+i//3*49
  out+=f'<rect x="{xx}" y="{yy}" width="45" height="45" rx="5" fill="{COLORS[c]}" stroke="#334155" stroke-width="2"/>'
  out+=txt(xx+22,yy+29,LABEL[c],17)
 if mark is not None:
  xx=x+mark%3*49; yy=y+mark//3*49
  out+=f'<rect x="{xx-4}" y="{yy-4}" width="53" height="53" rx="7" fill="none" stroke="#7c3aed" stroke-width="4"/>'
 return out
def save(name,title,body,footer):
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(footer)}</desc><rect width="800" height="400" rx="20" fill="#f8fafc"/><g font-family="system-ui, PingFang SC, Microsoft YaHei, sans-serif">'+txt(400,43,title,27)+body+txt(400,366,footer,19)+'</g></svg>'
 (OUT/(name+'.svg')).write_text(svg)
def panels(name,title,items,footer):
 b=''; step=800/len(items)
 for i,(label,state,sub) in enumerate(items):
  center=step*(i+.5)
  b+=txt(center,93,label)+grid(center-71.5,120,state,2 if name=='05-yellow' and i==1 else None)+txt(center,308,sub,min(19,(step-28)/len(sub)))
 save(name,title,b,footer)
panels('01-daisy','01 / 小花 → 对色 → 白色十字', [('顶面','?W?WYW?W?','黄心 · 白色棱块'),('正面','?G??G????','白绿棱的绿色对准绿心'),('底面','?W?WWW?W?','对应侧面转 180°')],'灰色表示本步不关注；角块不算花瓣。')
panels('02-first-layer','02 / 白色一面完成，还要检查侧面', [('底面','WWWWWWWWW','底面九格全白'),('正面','????G?GGG','底下一排与中心同色'),('右面','????R?RRR','四个侧面都要这样')],'角块由三种颜色共同确定位置，不能只看白色。')
panels('03-middle','03 / 第二层：先对正面，再判断左右', [('正面','?G??G?GGG','顶层棱块绿色对准绿心'),('顶面','????Y??R?','靠近自己的顶色是红色'),('右侧目标槽','???RRRRRR','若红心在右，插入右侧')],'这是位置示意；灰色格子的颜色不作要求。')
panels('04-cross','04 / 黄色十字：每轮开始前重新摆好', [('点','????Y????','先做一轮，再观察'),('直角','?Y?YY????','两臂朝后、朝左'),('横线INE','???YYY???','横线左右放平')],'俯视图：图的下边靠近自己。前面转一下 → 右手一次 → 前面转回。')
panels('05-yellow','05 / 翻面补黄：固定右前下角', [('底面','?Y?YYY?Y?','黄色中心朝下'),('固定工作位','?YYYYY?Y?','图中右上角＝右前下角'),('完成','YYYYYYYYY','四角完成，再把底层对齐')],'底面图从下方看：图的上边对应魔方正面。只转底层换角。')
panels('06-headlights','06 / “手提袋”：先看两角，再看中心', [('同色角 / PAIR','GRG?G????','顶排两端都是绿色'),('完整手提袋','GRGGGGGGG','角已对中心，只差顶棱'),('完整侧面','GGGGGGGGG','这一面九格同色')],'先把同色角对准同色中心，再把这一面放到左手边。')
# Replace schematic final faces with a physically valid U-permutation example.
panels('07-last-edges','07 / 完整面朝前：后面缺橙色，橙色在左', [('左面','BOBBBBBBB','左顶棱是橙色 → 左手先做'),('后面','OROOOOOOO','橙心，顶棱却是红色'),('右面','RBRRRRRRR','右顶棱是蓝色')],'此例正面全绿：左 1 → 右 1 → 左 5 → 右 5。')
b=''
for row,(title,moves,notes) in enumerate([('右手',['上','去','下','回'],['右层向上','顶层向左','右层向下','顶层向右']),('左手',['上','去','下','回'],['左层向上','顶层向右','左层向下','顶层向左'])]):
 y=85+row*128; b+=txt(112,y+38,title,21)
 for i,(m,n) in enumerate(zip(moves,notes)):
  x=280+i*140; b+=f'<rect x="{x-58}" y="{y-5}" width="116" height="94" rx="12" fill="#e2e8f0"/>'+txt(x,y+33,m,30)+txt(x,y+67,n,17)
save('00-moves','只记一个口诀：上 → 去 → 下 → 回',b,'左右方向按面对魔方时看到的顶层前沿判断；每次转 90°。')
