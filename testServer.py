import BaseHTTPServer
from SimpleHTTPServer import SimpleHTTPRequestHandler

##addr = ("0.0.0.0", 8765)
addr = ("0.0.0.0", 8000)

serv = BaseHTTPServer.HTTPServer(addr, SimpleHTTPRequestHandler)

serv.serve_forever()