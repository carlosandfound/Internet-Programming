import socket
import os
import stat
import sys
import time

from threading import Thread
from argparse import ArgumentParser
CRLF = '\r\n'

BUFSIZE = 4096

# keywords for errors
OK = 'HTTP/1.1 200 OK\n'
MOVED_PERMANENTLY = 'HTTP/1.1 301 MOVED PERMANENTLY{}Location:  https://www.cs.umn.edu/{}Connection: close{}{}'.format(CRLF, CRLF, CRLF, CRLF)
NOT_FOUND = 'HTTP/1.1 404 NOT FOUND{}Connection: close{}{}'.format(CRLF, CRLF, CRLF)
FORBIDDEN = 'HTTP/1.1 403 FORBIDDEN{}Connection: close{}{}'.format(CRLF, CRLF, CRLF)
METHOD_NOT_ALLOWED = 'HTTP/1.1 405 METHOD NOT ALLOWED{}Allow: GET, HEAD, POST, PUT, DELETE, OPTIONS{}Connection: close{}{}'.format(CRLF, CRLF, CRLF, CRLF)
NOT_ACCEPTABLE = 'HTTP/1.1 406 NOT ACCEPTABLE\n'

def read_file(resource, type):
    '''Read a file given its name and type to read it in the appropriate manner'''
    if (type == 'jpg' or type == 'png' or type == 'gif' or type == 'ico'):
        with open(resource, 'rb') as f:
            return f.read()
    else:
        with open(resource, 'r') as f:
            return f.read()

def is_readable(resource):
    '''Returns True if type has read permissions set on 'others'''
    stmode = os.stat(resource).st_mode
    return (getattr(stat, 'S_IROTH') & stmode) > 0

def accept_type(data, ftype):
    '''Check whether return source is acceptable'''
    data_str = data.decode('utf-8')
    data_lines = data_str.split("\n")
    for line in data_lines:
        if 'Accept:' in line:
            if '*/*' in line:
                return True
            if 'text/' in line and ftype.split('/')[0] == 'text':
                return True
            if 'image/' in line and ftype.split('/')[0] == 'image':
                return True
            if ftype not in line:
                return False
    return True

def get_header(code, content, ftype):
    '''Generate header given the code, content and file type'''
    if (code == 200): # no errors
        print('200 SERVING REQUEST')
        header = OK
        header += 'Content-Type: ' + ftype + '\n'
    elif code == 301: # redirection
        print('301: REDIRECTION')
        return MOVED_PERMANENTLY
    elif code == 403: # permission error
        print('403: FORBIDDEN')
        return FORBIDDEN
    elif code == 404: # file not found error
        print('404: FILE NOT FOUND')
        return NOT_FOUND
    elif code == 405: # bad request
        print('405: BAD REQUEST')
        return METHOD_NOT_ALLOWED
    else: # 406 header not accepted
        print('406 NOT ACCEPTED')
        return NOT_ACCEPTABLE
    contentlen = len(content)
    date = time.strftime("%a, %d %b %Y %H:%M:%S", time.localtime())
    header += 'Date: ' + date + '\n'
    header += 'Content-Length: ' + str(contentlen) + '\n'
    header += 'Connection: close\n\n'
    return header

def get_time(time):
    '''Convert time input in submitted form to appropriate format for response page'''
    split_time = time.split("%3A")
    hour = int(split_time[0])
    minutes = split_time[1]
    if hour == 00:
        return '12' + ':' + minutes + ' AM'
    elif hour == 12:
        return '12' + ':' + minutes + ' PM'
    elif hour > 12:
        hour = str(hour - 12)
        return hour + ':' + minutes + ' PM'
    else:
        return str(hour) + ':' + minutes + ' AM'

def process_request(client_sock, client_addr, data, request):
    linelist = request.strip().split(CRLF)
    reqline = linelist[0].split()
    req = reqline[0]
    if len(reqline) == 0: # no request given to server
        return None
    elif req == 'GET':
        resource = reqline[1][1:]
        resource_list = resource.split('.')
        # check if resource is supplied with GET request
        if len(resource_list) > 0:
            if len(resource_list) > 1:
                type = resource_list[1]
                return process_GET(data, resource, type)
            else:
                return process_GET(data, resource, '')
        else:
            print("Resource provided isn't in correct format")
            return None
    elif req == 'POST':
        return process_POST(client_sock, data)
    elif req == 'OPTIONS':
        option_resource = reqline[1]
        return process_OPTIONS(option_resource)
    elif req == 'HEAD' or req == 'DELETE' or req == 'PUT':
        return None # these requests were implemented for bonus points
    else:
        return (get_header(405, '', None), '405')

def process_GET(data, resource, type):
    print("Processing GET request")
    if resource == 'csumn': # redirect if the resource is named 'csumn'
        header = get_header(301, '', None)
        return (header, None, None)
    else:
        try:
            fstat = os.stat(resource)
        except FileNotFoundError: # check if resource exists
            content = read_file('404.html', 'text')
            header = get_header(404, content, None)
            return (header, content)

        if not is_readable(resource): # check is respurce has read permissions
            content = read_file('403.html', 'text')
            header = get_header(403, content, None)
            return (header, content)

        # extract the content type of the resource type to correctly generate the resource's content
        ftype = ''
        if type == 'html':
            ftype = 'text/html'
        elif type == 'css':
            ftype = 'text/css'
        elif type == 'js':
            ftype = 'application/javascript'
        elif type == 'jpg':
            ftype = 'image/jpg'
        elif type == 'png':
            ftype = 'image/png'
        elif type == 'gif':
            ftype = 'image/gif'
        elif type == 'ico':
            ftype = 'image/webp'
        else:
            # default resource type is text
            ftype = 'text/html'

        if accept_type(data, ftype): # check if resource type is acceptable
            content = read_file(resource, type)
            header = get_header(200, content, ftype)
            return (header,content)
        else: # no content to display if the resource file isn't acceptable
            header = get_header(406, '', None)
            return (header, None)

def process_POST(client_sock, data):
    print("Processing POST request")
    data_str = data.decode('utf-8')
    data_lines = data_str.split('\n')
    message = data_lines[-1]
    data = message.split("&")

    # Parse information from client
    name = data[0].split('=')[1]
    address1 = data[1].split('=')[1]
    address2 = data[2].split('=')[1]
    starttime = data[3].split("=")[1]
    endtime = data[4].split("=")[1]
    info = data[5].split("=")[1]
    url = data[6].split("=")[1]

    # convert information to appropriate format for response page
    name = name.replace('+', ' ')
    address1 = address1.replace('+', ' ')
    address2 = address2.replace('%2C', ',')
    address2 = address2.replace('+', ' ')
    starttime = get_time(starttime)
    endtime = get_time(endtime)
    info = info.replace('+', ' ')
    url = url.replace('%2F', '/')
    url = url.replace('%3A', ':')

    #generate html page
    #field name for Additional Info URL is urlinfo
    content = '''<!DOCTYPE html>
    <html>
        <body>
            <h3>Following Form Data Submitted Successfully:</h3>
            <p> Place Name: ''' + name + ''' </p>
            <p> Address Line 1: ''' + address1 + ''' </p>
            <p> Address Line 2: ''' + address2 + ''' </p>
            <p> Open Time: ''' + starttime + ''' </p>
            <p> End Time: ''' + endtime + ''' </p>
            <p> Additional Info: ''' + info + ''' </p>
            <p> URL: ''' + url + ''' </p>
        </body>
    </html> '''

    header = get_header(200, content, 'text/html')
    return (header, content)

def process_OPTIONS(resource):
    # Name used for hardcoding is calendar.html. NOT places.html
    print("Processing OPTIONS request")
    options = None
    if resource == '/calendar.html':
        options = 'OPTIONS, GET, HEAD'
    elif resource == '/form.html' or resource == '/':
        options = 'OPTIONS, GET, HEAD, POST'
    if options:
        header = OK
        header += 'Allow: ' + options + '\n'
        header += 'Cache-Control: max-age=604800\n'
        date = time.strftime("%a, %d %b %Y %H:%M:%S", time.localtime())
        header += 'Date: ' + date + '\n'
        header += 'Content-Length: 0\n'
        return(header, None )
    return None

def client_talk(client_sock, client_addr):
    print('talking to {}'.format(client_addr))
    data = client_sock.recv(BUFSIZE)
    while data:
        req = data.decode('utf-8') #returns a string
        print(req) # print request msg to stdin
        response = process_request(client_sock, client_addr, data, req)
        if response:
            header = response[0]
            content = response[1]
            client_sock.send(header.encode('utf-8'))
            if content:
                if isinstance(content, str):
                    client_sock.send(content.encode('utf-8'))
                else:
                    client_sock.send(content)
            data = False # don't take in any more data after serving a response
        else:
            data = client_sock.recv(BUFSIZE)
    #once we get a response, we chop it into utf encoded bytes
    #and send it (like EchoClient)

    #clean up the connection to the client
    #but leave the server socket for recieving requests open
    client_sock.shutdown(1)
    client_sock.close()
    print('connection closed.')

class EchoServer:
  def __init__(self, host, port):
    print('listening on port {}'.format(port))
    self.host = host
    self.port = port

    self.setup_socket()

    self.accept()

    self.sock.shutdown()
    self.sock.close()

  def setup_socket(self):
    self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    self.sock.bind((self.host, self.port))
    self.sock.listen(128)

  def accept(self):
    while True:
      (client, address) = self.sock.accept()
      th = Thread(target=client_talk, args=(client, address))
      th.start()

def parse_args(args):
    num_args = len(args) - 1
    if num_args == 1:
        # assume that the argument given is an integer port
        port = int(args[1])
        return ('localhost', port)
    elif num_args == 0:
        # default port is 9001
        return ('localhost', 9001)
    else:
        print('Too many arguments provided. The maximum is 1, but you provided', num_args)
        exit()

if __name__ == '__main__':
    (host, port) = parse_args(sys.argv)
    EchoServer(host, port)
