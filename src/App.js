import React, { Component } from 'react';
import logo from './fo.png';
import girl from './girl.png';
import letseat from './logo.svg';
import './App.css';
import 'fetch-ie8';
import FacebookLogin from 'react-facebook-login';

import Twitter from 'react-icons/lib/fa/twitter';
import Fb from 'react-icons/lib/fa/facebook-official';
// finals
/*
    COMM - Saturday, 5/6, 9:30am, Rooms TBA
    MUSIC - Whenever
    BIO - May 5th, 4 - 6 PM
    PHIL - Friday May 5, 2017, Room PSFA436, Time 10:30 – 12:30
    MATH - Thursday, May 11, 1030-1230

*/


class Topbar extends Component {

    render() {
        return (
            <div className="topbar">
                <h1 className="title">Food Offender</h1>
                <h2 className="subtitle">Public shaming friends because they can't decide what to eat.</h2>
                <img src={logo} alt="Food Offender Logo" />
            </div>
        );
    }
}

class Add extends Component {
    constructor(props) {
        super(props);

        this.state = {sent:false,fbdata: null,name:"",img:"",hours:"",minutes:"",relation:"Friend"};
        this.responseFacebook = this.responseFacebook.bind(this);
        this.select = this.select.bind(this);
        this.hchange = this.hchange.bind(this);
        this.mchange = this.mchange.bind(this);
        this.rchange = this.rchange.bind(this);
        this.onsubmit = this.onsubmit.bind(this);
        this.back = this.back.bind(this);
    }

    hchange(e) {
        this.setState({hours:e.target.value});
    }

    mchange(e) {
        this.setState({minutes:e.target.value});
    }

    rchange(e) {
        this.setState({relation:e.target.value});
    }

    onsubmit(e) {
        // okay this is where stuff goes down...
        var data = {
            requestType:"add",
            name: this.state.name,
            hours: parseInt(this.state.hours),
            minutes: parseInt(this.state.minutes),
            img: this.state.img,
            relation: this.state.relation
        };
        var _this = this;
        fetch("http://localhost:3001/api", {method:"POST",body:JSON.stringify(data)}).then(function(e) {
            return e.json();
        }).then(function(resp) {
            // done
            console.log("done");
            _this.setState({sent:true});
        });

        e.preventDefault();
    }

    responseFacebook(resp) {
        console.log(resp);
        this.setState({fbdata: resp});
    }

    select(_name,_img)
    {
        this.setState({name:_name,img:_img});
    }

    back()
    {
        this.setState({sent:false,fbdata: null,name:"",img:"",hours:"",minutes:"",relation:"Friend"});
    }

    render() {

        if(this.state.sent == true)
        {
            return (
                <div className="add" style={{backgroundColor:"#fff"}}>
                    <After back={this.back} />
                </div>
            );
        }

        return (
            <div className="add">
                <h2>Add Offender</h2>
                <form onSubmit={this.onsubmit}>
                    <div className="form-group">
                        <h3>Choose Offender</h3>
                        <p>Choose your friend through Facebook</p>
                        {(this.state.fbdata == null) ?
                            <FacebookLogin 
                                appId="1886252204983791"
                                autoLoad={true}
                                scope="public_profile,email,user_friends"
                                fields="name,email,picture,taggable_friends"
                                callback={this.responseFacebook}
                                cssClass="my-facebook-button-class"
                            />
                        :
                            (this.state.name.length < 1) ?
                                <FriendList {...this.state} selected={this.select} />
                            :
                                <table><tbody>
                                <Friend click={this.select} name={this.state.name} img={this.state.img} search=""/>
                                </tbody></table>
                        }
                    </div>

                    <div className="form-group">
                        <h3>Time Wasted</h3>
                        <p>How much of your time was wasted?</p>
                        <div className="halves">
                            <input placeholder="Hours" type="number" onChange={this.hchange} value={this.state.hours} />
                        </div>
                        <div className="halves">
                            <input placeholder="Minutes" type="number" onChange={this.mchange} value={this.state.minutes} />
                        </div>  
                    </div>

                    <div className="form-group">
                        <h3>Relation</h3>
                        <p>Why do you put up with this person?</p>
                        <select value={this.state.relation} onChange={this.rchange}>
                            <option>Friend</option>
                            <option>Dad</option>
                            <option>Mom</option>
                            <option>Boyfriend</option>
                            <option>Girlfriend</option>
                            <option>Son</option>
                            <option>Daughter</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <input type="hidden" value={this.state.name} name="name" />
                    <input type="hidden" value={this.state.img} name="img" />
                    <button className="addbtn">Tired of This Shit</button>
                </form>
            </div>
        );
    }
}

class FriendList extends Component {
    constructor(props) {
        super(props);
        console.log(this.props);

        this.keypress = this.keypress.bind(this);
        this.loadmore = this.loadmore.bind(this);
        this.addfriends = this.addfriends.bind(this);

        this.state = {search: "",friends: this.props.fbdata.taggable_friends.data};

    }

    loadmore(link) {
        var _this = this;
        fetch(link).then(function(resp) {
            return resp.json();
        }).then(function(next) {
            console.log(next);
            _this.addfriends(next.data);
            if(next.paging.next != undefined) _this.loadmore(next.paging.next);
        }) 
    }

    addfriends(fr) {
        this.setState({friends: this.state.friends.concat(fr)});
    }


    componentWillMount() { 

        var next = this.props.fbdata.taggable_friends.paging.next;

        if(next != undefined) this.loadmore(next);
    }


    keypress(e)
    {
        this.setState({search: e.target.value});
    }

    render() {
        return (
            <div className="friendlist">
                <input type="search" value={this.state.search} onChange={this.keypress} className="search" placeholder="Search for a friend" />
                <table>
                    <tbody>
                    {this.state.friends.map(
                         (data) => <Friend click={this.props.selected} search={this.state.search} key={data.id} name={data.name} img={data.picture.data.url} />
                    )}
                    </tbody>
                </table>
            </div>
        );
    }
}

class Friend extends Component {
    constructor(props) {
        super(props);

        this.state = {hover: false};

        this.onclick = this.onclick.bind(this);

    }

    onclick() {
        this.props.click(this.props.name,this.props.img);
    }


    render() {
        if(this.props.name.toLowerCase().indexOf(this.props.search.toLowerCase()) == -1) return false

        return (
            <tr className="friend" onClick={this.onclick}>
                <td className="img"><img src={this.props.img} alt={this.props.name} /></td>
                <td>{this.props.name}</td>
            </tr>

        )
    }
}

class NewPage extends Component {
    render() {
        return (
        
            <tr>
                <td style={{display:'block',width: "90%"}}><button onClick={this.props.click} type="button">Load More</button></td>
            </tr>

        );
    }
}

class List extends Component {
    constructor(props) {
        super(props);

        this.state = {"list":[],"search":""};

        this.refresh = this.refresh.bind(this);
        this.getnext = this.getnext.bind(this);
        this.chsearch = this.chsearch.bind(this);
    }

    componentWillMount() {
        this.refresh();
        //setInterval(this.refresh, 10000);
    }

    getnext() {
        this.refresh(this.state.list.length);
    }

    chsearch(e) {
        this.setState({search:e.target.value});

        var _this = this;
        fetch("http://localhost:3001/api?requestType=get&search="+e.target.value).then(function(e) {
            return e.json();
        }).then(function(resp) {
            var i=1;
            resp.forEach(function(e) {e.rank = i++;});
            _this.setState({list:resp});
        });
    }

    refresh(index)
    {
        var _this = this;
        var start = index == undefined ? 0 : index;
        fetch("http://localhost:3001/api?requestType=get&start="+start).then(function(e) {
            return e.json();
        }).then(function(resp) {
            var i=1+start;
            resp.forEach(function(e) {e.rank = i++;});
            if(start > 0) {
                _this.setState({list:_this.state.list.concat(resp)});
            }
            else {
                _this.setState({list:resp});
            }
        });
    }

    render() {
        return (
            <div className="list">
                <input type="search" placeholder="Search Offenders" onChange={this.chsearch} value={this.state.search} />
                <table>
                    <thead>
                        <tr>
                            <th>Ranking</th>
                            <th>Name</th>
                            <th>Time Wasted</th>
                            <th>Relation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.list.map(function(data) {
                            return <ListRow {...data} key={data.rank} />;
                        })} 
                        <NewPage click={this.getnext} />
                    </tbody>
               </table>
            </div>
        );
    }
}

class ListRow extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (

            <tr>
                <td>{this.props.rank}. &nbsp;<img src={this.props.img} alt={this.props.name} /></td>
                <td>{this.props.name}</td>
                <td>{this.props.hours}h {this.props.minutes}m</td>
                <td>{this.props.relation}</td>
            </tr>

        );
    }
}


class Body extends Component {

    render() {
        return (
            <div className="body">
                <Add />
                <List />
            </div>
        );
    }
}

class Email extends Component {
    constructor(props)
    {
        super(props);

        this.state = {"email":"","help": "We promise to only email you once - when we launch - we respect your privacy."};
        this.keypress = this.keypress.bind(this);
        this.onclick = this.onclick.bind(this);
    }

    keypress(e)
    {
        this.setState({email: e.target.value});
        window.fetch("http://localhost:3001/api?requestType=email&email="+e.target.value, {allowCORS: true}).then(function(resp) {
            
            console.log(resp);
        });

    }

    onclick(e)
    {

        if(this.state.email.length > 0)
        {
            this.setState({help: "Thank you for your interest. We will email you when Let's eat is ready."});
        }
    }

    render() {
        return (
            <div className="email">
                <div className="form-group">
                    <input placeholder="Your@email.com" onBlur={this.keypress} type="email" />
                    <button type="button" onClick={this.onclick} >Go!</button>
                </div>
                <div className="help-text">{this.state.help}</div>
            </div>
        );
    }
}

class After extends Component {

    constructor(props)
    {
        super(props);

        this.tweet = this.tweet.bind(this);
    }


    tweet()
    {
        window.open("https://twitter.com/intent/tweet?text=Food%20Offender:%20foodoffender.com","_blank","toolbar=no,scrollbars=no,resizable=yes,width=500,height=400,top=200,left=300");
    }


    render()
    {
        return (
            <div className="after">
                <h2>Brought to you by</h2>
                <div className="img">
                    <img src={letseat} alt="Let's eat logo" />
                </div>
                <h3>Friends don't let friends<br/>suffer when trying to eat.</h3>

                <button type="button" className="fb"><Fb style={{paddingBottom:'3px'}} /> Share</button> 
                <button type="button" onClick={this.tweet} className="tw"><Twitter style={{paddingBottom:'3px'}} /> Tweet</button>                 
                <button type="button" onClick={this.props.back}>Add More Offenders</button>
            </div>
        );
    }

}

class Bottombar extends Component {

    render() {
        return (
            <div className="bottombar">
                <div className="bleft">
                    Deal with indecisiveness and arguing just to<br/>
                    eat? <span className="orange">Let's Eat</span> will solve this problem soon.<br/>
                    <span className="red">BE THE FIRST TO KNOW WHEN WE LAUNCH</span>
                </div>
                <div className="bright">
                    <Email />
                </div>
                <div className="img">
                    <img src={girl} />
                </div>
            </div>
        );
    }
}


class App extends Component {
    render() {
        return (
            <div className="App">
                <Topbar />
                <Body />
                <Bottombar />
            </div>
        );
    }
}


export default App;
