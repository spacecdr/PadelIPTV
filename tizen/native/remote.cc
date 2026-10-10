// Small bounded HTTP transport. Authorization and routing live in remote-server.js.
#include <algorithm>
#include <cctype>
#include <cstdlib>
#include <map>
#include <string>
#include "ppapi/c/pp_errors.h"
#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/cpp/core.h"
#include "ppapi/cpp/tcp_socket.h"
#include "ppapi/cpp/net_address.h"
#include "ppapi/cpp/var_dictionary.h"
#include "ppapi/utility/completion_callback_factory.h"
class Server;
class Connection {
 public:
  Connection(Server* owner,int id,const pp::TCPSocket& socket);
  ~Connection(){socket_.Close();}
  void Read(); void ReadDone(int32_t result); void Reply(const std::string& response);
  void WriteDone(int32_t result); void Deadline(int32_t); void Finish();
  Server* owner_; int id_; pp::TCPSocket socket_; pp::CompletionCallbackFactory<Connection> callbacks_;
  char buffer_[4096]; std::string request_,response_; size_t sent_; bool dispatched_;
};
class Server:public pp::Instance {
 public:
  explicit Server(PP_Instance i):pp::Instance(i),socket_(this),callbacks_(this),next_(0){}
  ~Server(){socket_.Close();for(auto& c:connections_)delete c.second;}
  bool Init(uint32_t,const char*[],const char*[]) override {
    if(!pp::TCPSocket::IsAvailable()){Status("TCP non disponibile");return true;}
    PP_NetAddress_IPv4 addr={};addr.port=((8768 & 255) << 8) | (8768 >> 8);pp::NetAddress net(this,addr);
    socket_.Bind(net,callbacks_.NewCallback(&Server::Bound));return true;
  }
  void Status(const std::string& error){pp::VarDictionary d;d.Set("event",error.empty()?"ready":"error");d.Set("error",error);PostMessage(d);}
  void Bound(int32_t r){if(r<0){Status("Bind TCP: "+std::to_string(r));return;}socket_.Listen(8,callbacks_.NewCallback(&Server::Listening));}
  void Listening(int32_t r){if(r<0){Status("Listen TCP: "+std::to_string(r));return;}Status("");Accept();}
  void Accept(){socket_.Accept(callbacks_.NewCallbackWithOutput(&Server::Accepted));}
  void Accepted(int32_t r,pp::TCPSocket socket){if(r<0){Status("Accept TCP: "+std::to_string(r));return;}if(connections_.size()>=8)socket.Close();else{int id=++next_;auto c=new Connection(this,id,socket);connections_[id]=c;c->Read();}Accept();}
  void HandleMessage(const pp::Var& v) override {if(!v.is_dictionary())return;pp::VarDictionary d(v);auto id=d.Get("id"),response=d.Get("response");if(!id.is_int()||!response.is_string())return;auto i=connections_.find(id.AsInt());if(i!=connections_.end())i->second->Reply(response.AsString());}
  void Request(int id,const std::string& req,const std::string& ip){pp::VarDictionary d;d.Set("id",id);d.Set("request",req);d.Set("ip",ip);PostMessage(d);}
  pp::TCPSocket socket_;pp::CompletionCallbackFactory<Server> callbacks_;std::map<int,Connection*> connections_;int next_;
};
Connection::Connection(Server* o,int id,const pp::TCPSocket& s):owner_(o),id_(id),socket_(s),callbacks_(this),sent_(0),dispatched_(false){pp::Module::Get()->core()->CallOnMainThread(10000,callbacks_.NewCallback(&Connection::Deadline));}
void Connection::Deadline(int32_t){Finish();}
void Connection::Finish(){socket_.Close();owner_->connections_.erase(id_);delete this;}
void Connection::Read(){socket_.Read(buffer_,sizeof(buffer_),callbacks_.NewCallback(&Connection::ReadDone));}
void Connection::ReadDone(int32_t r){
 if(r<=0){Finish();return;}request_.append(buffer_,r);if(request_.size()>16384){Finish();return;}
 size_t end=request_.find("\r\n\r\n");if(end==std::string::npos){if(request_.size()>8192){Finish();return;}Read();return;}
 if(end>8192){Finish();return;}std::string headers=request_.substr(0,end);std::transform(headers.begin(),headers.end(),headers.begin(),[](unsigned char c){return std::tolower(c);});
 if(headers.find("\r\ntransfer-encoding:")!=std::string::npos){Finish();return;}
 size_t length=0,pos=headers.find("\r\ncontent-length:");
 if(pos!=std::string::npos){if(headers.find("\r\ncontent-length:",pos+1)!=std::string::npos){Finish();return;}size_t start=pos+17,stop=headers.find("\r\n",start);std::string value=headers.substr(start,stop==std::string::npos?stop:stop-start);char* tail=nullptr;long n=strtol(value.c_str(),&tail,10);while(tail&&*tail==' ')++tail;if(tail==value.c_str()||!tail||*tail||n<0||n>8192){Finish();return;}length=n;}
 if(request_.size()<end+4+length){Read();return;}if(request_.size()!=end+4+length){Finish();return;}
 dispatched_=true;callbacks_.CancelAll();pp::Module::Get()->core()->CallOnMainThread(75000,callbacks_.NewCallback(&Connection::Deadline));
 owner_->Request(id_,request_,socket_.GetRemoteAddress().DescribeAsString(false).AsString());
}
void Connection::Reply(const std::string& response){if(!dispatched_||!response_.empty())return;if(response.size()>256*1024){Finish();return;}response_=response;socket_.Write(response_.data(),response_.size(),callbacks_.NewCallback(&Connection::WriteDone));}
void Connection::WriteDone(int32_t r){if(r<=0){Finish();return;}sent_+=r;if(sent_>=response_.size()){Finish();return;}socket_.Write(response_.data()+sent_,response_.size()-sent_,callbacks_.NewCallback(&Connection::WriteDone));}
class RemoteModule:public pp::Module {public:pp::Instance* CreateInstance(PP_Instance i)override{return new Server(i);}};
namespace pp {Module* CreateModule(){return new RemoteModule();}}
