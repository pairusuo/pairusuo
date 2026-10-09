"""Sticker geometry for reproducible tutorial illustrations."""
from itertools import product
from copy import deepcopy
N={'R':(1,0,0),'L':(-1,0,0),'U':(0,1,0),'D':(0,-1,0),'F':(0,0,1),'B':(0,0,-1)}
def solved():
 return [[tuple(p),n,f] for f,n in N.items() for p in product(range(-1,2),repeat=3) if sum(a*b for a,b in zip(p,n))==1]
def rot(v,a,s):
 x,y,z=v
 return ((x,-s*z,s*y),(s*z,y,-s*x),(-s*y,s*x,z))[a]
def run(c,seq):
 for m in seq.split():
  f=m[0]; n=N.get(f,(1,0,0) if f=='x' else (0,1,0)); a=next(i for i,x in enumerate(n) if x); s=-n[a]
  for _ in range(2 if '2' in m else 3 if "'" in m else 1):
   for st in c:
    if f in 'xy' or st[0][a]==n[a]: st[0],st[1]=rot(st[0],a,s),rot(st[1],a,s)
 return c
def face(c,f):
 n=N[f]; sts=[s for s in c if s[1]==n]
 if f=='U': key=lambda s:(s[0][2],s[0][0])
 elif f=='D': key=lambda s:(-s[0][2],s[0][0])
 elif f=='F': key=lambda s:(-s[0][1],s[0][0])
 elif f=='B': key=lambda s:(-s[0][1],-s[0][0])
 elif f=='R': key=lambda s:(-s[0][1],-s[0][2])
 else: key=lambda s:(-s[0][1],s[0][2])
 return ''.join(s[2] for s in sorted(sts,key=key))
def inv(seq): return ' '.join(m[0] if "'" in m else m if '2' in m else m+"'" for m in reversed(seq.split()))
A="R U R' U'"; B="L' U' L U"
