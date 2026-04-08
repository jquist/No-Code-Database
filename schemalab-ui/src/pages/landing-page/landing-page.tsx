// import background from "../../assets/landing-page-background.png";
import logo from "../../assets/schemalab-logo-no-text.svg";
import { Button, Card, Avatar, Popover } from 'antd';
import "./landing-page.scss";
import { GitlabOutlined } from '@ant-design/icons';
import typescript from "../../assets/landing-page-cards/typescript.svg";
import react from "../../assets/landing-page-cards/react.svg";
import django from "../../assets/landing-page-cards/django.svg";
import express from "../../assets/landing-page-cards/express.svg";
import postgresql from "../../assets/landing-page-cards/postgresql.svg";
import nginx from "../../assets/landing-page-cards/nginx.svg";
import javascript from "../../assets/landing-page-cards/javascript.svg";
import docker from "../../assets/landing-page-cards/docker.svg";
import { useNavigate } from "react-router-dom";

const ben = (
    <div>
        <p>bn00299@surrey.ac.uk</p>
    </div>
);

const sanjay = (
    <div>
        <p>ss04662@surrey.ac.uk</p>
    </div>
);

const saker = (
    <div>
        <p>sm03582@surrey.ac.uk</p>
    </div>
);

const jonathan = (
    <div>
        <p>jp01821@surrey.ac.uk</p>
    </div>
);

const jess = (
    <div>
        <p>jn00748@surrey.ac.uk</p>
    </div>
);

const xinRu = (
    <div>
        <p>xw00892@surrey.ac.uk</p>
    </div>
);

export function LandingPage() {
    const navigate = useNavigate();

    return (
        <>
            <div className="nav">
                <div className="left">
                    <div className="logo">
                        <a href='/'><img className="logo-img" src={logo} /></a>
                        <p className="logo-text">SchemaLab</p>
                    </div>
                </div>
                <div className="right">
                    <Button onClick={() => navigate('/login')}>Login</Button>
                    <Button onClick={() => navigate('/register')} type="link">Register</Button>
                </div>



            </div>

            <div className="hero">
                {/* <div className="background"><img src={background} className="background-img" /></div> */}
                <div className="content">
                    <h1 className="title">SchemaLab</h1>
                    <p className="description">No code database creation tool for developers</p>
                    <Button className="startBtn" onClick={() => navigate('/register')}>Get Started</Button>
                    <Button type="link" className="gitlabBtn" onClick={() => window.location.href = 'https://gitlab.surrey.ac.uk/schemalab/no-code-db'}>< GitlabOutlined /> View project</Button>
                </div>
                {/* <div className="members">
                    <Avatar.Group size="large">
                        <Avatar style={{ backgroundColor: '#87d068' }}><Popover title="Ben Northridge" content={ben}>BN</Popover></Avatar>
                        <Avatar style={{ backgroundColor: '#68c0d0ff' }}><Popover title="Sanjay Shriharisha" content={sanjay}>SS</Popover></Avatar>
                        <Avatar style={{ backgroundColor: '#bf68d0ff' }}><Popover title="Saker Mohammad" content={saker}>SM</Popover></Avatar>
                        <Avatar style={{ backgroundColor: '#d35f5fff' }}><Popover title="Jonathan Peace" content={jonathan}>JP</Popover></Avatar>
                        <Avatar style={{ backgroundColor: '#d0c668ff' }}><Popover title="Jessica Nordquist" content={jess}>JN</Popover></Avatar>
                        <Avatar style={{ backgroundColor: '#d39247ff' }}><Popover title="Xin Ru Wee" content={xinRu}>XW</Popover></Avatar>
                    </Avatar.Group>
                </div> */}
            </div>

            <div className="cards">
                <Card className="card">
                    <div className="img-section">
                        <img className="img" src={typescript} />
                        <p className="plus"> + </p>
                        <img className="img" src={react} />
                    </div>
                    <h2>Schemalab UI</h2>
                    <p>The frontend application which is the interface to SchemaLab. Built using React in Typescript, and ReactFlow.</p>
                    <Avatar.Group>
                        <Avatar style={{ backgroundColor: '#87d068' }}><Popover title="Ben Northridge" content={ben}>BN</Popover></Avatar>
                        <Avatar style={{ backgroundColor: '#68c0d0ff' }}><Popover title="Sanjay Shriharisha" content={sanjay}>SS</Popover></Avatar>
                    </Avatar.Group>
                </Card>

                <Card className="card">
                    <div className="img-section">
                        <img className="img" src={django} />
                        <p className="plus"> + </p>
                        <img className="img" src={postgresql} />
                    </div>
                    <h2>Project Management Service</h2>
                    <p>Backend service which manages and stores users projects. Built using Django in Python and PostgresSQL.</p>
                    <Avatar.Group>
                        <Avatar style={{ backgroundColor: '#bf68d0ff' }}><Popover title="Saker Mohammad" content={saker}>SM</Popover></Avatar>
                    </Avatar.Group>
                </Card>

                <Card className="card">
                    <div className="img-section">
                        <img className="img" src={express} />
                        <p className="plus"> + </p>
                        <img className="img" src={javascript} />
                    </div>
                    <h2>Schema Service</h2>
                    <p>Backend service that translates database designs into schemas. Built using Express in Javascript.</p>
                    <Avatar.Group>
                        <Avatar style={{ backgroundColor: '#d35f5fff' }}><Popover title="Jonathan Peace" content={jonathan}>JP</Popover></Avatar>
                        <Avatar style={{ backgroundColor: '#d0c668ff' }}><Popover title="Jessica Nordquist" content={jess}>JN</Popover></Avatar>
                    </Avatar.Group>
                </Card>

                <Card className="card">
                    <div className="img-section">
                        <img className="img" src={django} />
                        <p className="plus"> + </p>
                        <img className="img" src={postgresql} />
                    </div>
                    <h2>Auth Service</h2>
                    <p>Backend service that manages and provides all authentication functionality. Built using Django in Python and PostgresSQL.</p>
                    <Avatar.Group>
                        <Avatar style={{ backgroundColor: '#d39247ff' }}><Popover title="Xin Ru Wee" content={xinRu}>XW</Popover></Avatar>
                    </Avatar.Group>
                </Card>

                <Card className="card">
                    <div className="img-section">
                        <img className="img" src={docker} />
                    </div>
                    <h2>Deployment</h2>
                    <p>Docker was used to deploy and create stable enviroments so the apps to run.</p>
                </Card>

                <Card className="card">
                    <div className="img-section">
                        <img className="img" src={nginx} />
                    </div>
                    <h2>Routing</h2>
                    <p>Communication between services and port exposure was handled by traefik.</p>
                </Card>
            </div>
        </>
    )
}