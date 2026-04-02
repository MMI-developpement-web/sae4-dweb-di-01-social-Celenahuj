import Button from './components/ui/Button'; 
import Avatar from './components/ui/Avatar';
import Header from './components/Header';
import Input from './components/ui/Input';
import AuthCard from './components/AuthCard';
import Profil from './components/ui/Profil';
import TweetCard from './components/Tweet';
import { MessageCircle } from 'lucide-react';
import { Heart } from 'lucide-react';
import { Repeat2 } from 'lucide-react';
import { Ellipsis } from 'lucide-react';
import { Send } from 'lucide-react';


import Badge from './components/ui/Badge';


// import { HiArrowDownCircle } from "react-icons/hi2";

import { ArrowUpFromLine } from 'lucide-react';
import { TriangleAlert } from 'lucide-react';
import { CircleCheck } from 'lucide-react';

import Message from './components/Message';
import StatItem from './components/ui/StatItem';

function App() {
  return (
    <>
      <h1 className="bg-warning text-3xl font-bold underline">
        My UI library !
      </h1>

      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-2xl font-bold">Buttons</h1>
        <div className="mt-4 flex items-center gap-4">
          <Button variant = "secondary">
            Click me
          </Button>
          <Button variant = "danger">
            Click me
          </Button>
          <Button variant = "ghost">
            Click me
          </Button>
          <Button variant="outline" size="lg">
            <ArrowUpFromLine className="w-5 h-5" /> My button
          </Button>
        </div>
      </div>
      

      <div className="flex flex-col gap-4 p-4">
        <h2 className="text-xl font-bold">Badges</h2>
        <div className="flex gap-4">
        <Badge variant="primary" size="md">
          New
        </Badge>
        <Badge variant="secondary" size="md">
          New
        </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <h2 className="text-xl font-bold">Avatar</h2>
        <div className="flex gap-4">
        <Avatar src="https://picsum.photos/200/300" size="md" shape="circle" />
        <Avatar src="https://picsum.photos/200/300" size="md" shape="square" />
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <h2 className="text-xl font-bold">Composants</h2>
        <div className="flex gap-4 p-4">
            <Message>
            <TriangleAlert className="stroke-warning" />
            This is a message component
          </Message>

          <Message>
              <CircleCheck />
              This is a message component
          </Message>

          <Message>
              <TriangleAlert className="stroke-warning" />
              This is a message component
          </Message>

          <Message>
              <TriangleAlert className="stroke-warning" />
              This is a message component
          </Message>
        </div>
      </div>

      <AuthCard variant="primary" size="md">
        <h2 className="text-3xl font-bold">Login</h2>

        <div className="flex flex-col gap-4">
          <Input variant="primary" type="email" placeholder="Email" />
          <Input variant="primary" type="password" placeholder="Password" />
          <p>Forgot your password ?</p>
        </div>

        <Button variant="gradient">Login</Button>

        <p className="text-center">
          Don’t have account ?{" "}
          <span className="text-text-accent font-bold">Sign up</span>
        </p>
      </AuthCard>

      <AuthCard variant="primary" size="md">
        <h2 className="text-3xl font-bold">Sign In</h2>

        <div className="flex flex-col gap-4">
          <Input variant="primary" placeholder="Name" />
          <Input variant="primary" type="email" placeholder="Email" />
          <Input variant="primary" type="password" placeholder="Password" />
        </div>

        <Button variant="gradient">Sign up</Button>

        <p className="text-center">
          Don’t have account ?{" "}
          <span className="text-text-accent font-bold">Login</span>
        </p>
      </AuthCard>

      <div className="flex gap-4 p-4">
        <Button variant = "small" size="sm">
           Post
        </Button>
      </div>

      <Header>
        <Button variant="small" size="sm">
          Post
        </Button>
      </Header>
      <Profil>
          <Avatar src="https://picsum.photos/200/300" size="md" shape="circle" />
          <p>Quoi de neuf ??</p>
      </Profil>

      <TweetCard variant="primary" size="md">
        <Profil 
          className="cursor-pointer hover:opacity-80 transition-opacity w-full"
        >
          <Avatar src="https://picsum.photos/200/300" size="md" shape="circle" />
          <div className="flex flex-col justify-center">
            <div className="flex flex-row items-center gap-1 flex-wrap">
              <span className="text-body-sm font-bold m-0 p-0 text-text">Céléna Hujol</span>
              <span className="text-xs text-text-muted m-0 p-0">@céléna_hujol</span>
            </div>
            <time className="text-xs text-text-muted m-0 p-0">2 hours ago</time>
          </div>
        </Profil>
        <p className="text-lg mt-2">
          Quoi de neuf ??
        </p>
        <div className="flex justify-between">
          <div >
            <StatItem variant="primary" size="stat">
              <Button variant="icon" size="stat">
                <Heart />
              </Button>
              12
            </StatItem>
            <StatItem variant="primary" size="stat">
              <Button variant="icon" size="stat">
                <MessageCircle />
              </Button>
              12
            </StatItem>
            <StatItem variant="primary" size="stat">
              <Button variant="icon" size="stat">
                <Repeat2 />
              </Button>
              12
            </StatItem>
            <Button variant="icon" size="stat">
                <Ellipsis />
            </Button>
          </div>
          <Button variant="icon" size="stat">
              <Send />
          </Button>
        </div>
        
      </TweetCard>
      
      
      <p className="bg-bg">text</p>
      

  </>
  );}
export default App;
