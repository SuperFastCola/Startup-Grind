// main.js
var $ = require("jquery");
var React = require('react');
var Animate = require('animateCSS');
var ReactDOM = require('react-dom');
var marked = require('marked');
var css = require("stylesSheet");

//render author profile
var Author = React.createClass({
	render: function(){
		return (
			<div className="author-holder">
				<span className="author-name">{this.props.data.author}</span>
			</div>
		);
	}
});

//render comment date for United States.
var CommentDate = React.createClass({
	render: function(){

		var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		var commentDate = new Date(this.props.datetime);

		var usHour = commentDate.getHours();
		var timeOfDay = "AM";

		if(usHour>12){
			usHour-=12;
			timeOfDay = "PM";
		}

		var minutes = commentDate.getMinutes();

		if(String(minutes).length==1){
			minutes = String("0" + minutes);
		}

		commentDate = months[commentDate.getMonth()] + 
			" " + commentDate.getDate() + ", " + commentDate.getFullYear() + 
			" - " + usHour + ":" + minutes + timeOfDay;

		return (
			<div className="comment-date">{commentDate}</div>
		);
	}
})

//dpost deletion confirmation
var Confirmation = React.createClass({
	handleDelete: function(e){
		e.stopPropagation();

		if(e.target.getAttribute("data-delete")!=null){
			if(this.props.onDelete){
			   	this.props.onDelete(this.props.data);
			   	this.props.toggleConfirm();
			}
		}
		else{
			if(this.props.toggleConfirm){
				this.props.toggleConfirm();
			}
		}
  	},
	render: function(){
		return (
			<div className="confirmation-holder">
				<span>Delete this post?</span>
				<button className="button-confirm-delete" data-delete="1" onClick={this.handleDelete}>Yes</button>
				<button className="button-deny-delete" onClick={this.handleDelete}>No</button>
			</div>
		);
	}
});

//comment structure
var Comment = React.createClass({

	getInitialState: function(){
		return {
			public: true,
			deleted: false,
			confirmDelete: false,
			editingComment: false,
			commentBody: null,
			hasReplies: false,
			showReplies: false,
			authorLoggedIn: false 
		};
	},
	parseMarkup: function(item) {
    	var rawMarkup = marked(item.toString(), {sanitize: false});
    	//console.log(rawMarkup);

    	return { __html: rawMarkup };
  	},
  	toggleConfirm: function(){
  		this.setState({confirmDelete: !this.state.confirmDelete });
  	},
  	toggleReplies: function(e){
		this.setState({showReplies: !this.state.showReplies }); 
  	},
  	handleDelete: function(e){
  		e.stopPropagation();
  		this.toggleConfirm();
  	},
  	handleEdit: function(e){
  		e.stopPropagation();
  		this.setState({editingComment: !this.state.editingComment });  		
  	},
  	componentWillMount: function(){

  		var loggedin = (this.props.loggedInID===this.props.data.author_id)?true:false;

  		this.setState({
  			public:this.props.data.public,
  			delete:this.props.data.deleted,
  			commentBody: this.props.data.comment,
  			authorLoggedIn: loggedin
  		});

  		this.checkForReplies();

  	},
  	handleEditComment: function(e){
  		this.setState({ commentBody: String(e.target.value) });
  	},
  	checkForReplies: function(){
  		if(typeof this.props.data.comments != "undefined" && this.props.data.comments.length>0){
  			this.setState({hasReplies:true});
  		}

  	},
  	commentFunctions: function(confirmer){
  		return (
  			<div className="comment-functions">
				<button className="button-delete" onClick={this.handleDelete} >Delete</button>
				<button className="button-edit" onClick={this.handleEdit} >{ !this.state.editingComment ? "Edit" : "Save" }</button>
				{confirmer}
			</div>
		);
  	},
	render: function(){		
		if(this.state.confirmDelete){
			var confirmer = <Confirmation onDelete={this.props.onDelete} toggleConfirm={this.toggleConfirm} data={this.props.data} />;
		}

		var commentBody = <div className="comment-body" dangerouslySetInnerHTML={this.parseMarkup(this.state.commentBody)} />;
		if(this.state.editingComment){
			commentBody = <textarea className="comment-body-edit" value={this.state.commentBody} onChange={this.handleEditComment} />
		}

		return (
			<div className="comment-holder">
				<Author data={this.props.data} /> 
				<CommentDate datetime={this.props.data.datetime} />
				{commentBody}
				{ this.state.authorLoggedIn ? this.commentFunctions(confirmer) :  null }
				{this.state.hasReplies ? <button className="button-show-replies" onClick={this.toggleReplies} > { !this.state.showReplies ? "Show Comments" : "Hide Comments" }</button> : null }
				{ this.state.showReplies ? <RepliesList comments={this.props.data.comments} loggedInID={this.props.loggedInID} /> : null }

			</div>
		);
	}
});

//comment listing
var CommentList = React.createClass({
	getInitialState: function(){
		return {
			comments: []
		};
	},
	handleCommentClick: function(obj){
		var data = this.state.comments.slice();
		var index = 0;
		data.map(function(d){
			if(d.key==obj.id){
				data.splice(index,1);
				this.setState({comments:data});
			}
			index++;
		}.bind(this));
	},
	componentWillMount: function(){
		var allComments = [];
		this.props.comments.map(function(com){
			allComments.push(<Comment data={com} onDelete={this.handleCommentClick}  key={com.id} loggedInID={this.props.loggedInID} />)
		}.bind(this));

		this.setState({comments:allComments});
	},
	render: function(){

		return (
			<div className="comments-holder">
				{this.state.comments}
			</div>
		);
	}
});

//replies listing
var RepliesList = React.createClass({
	getInitialState: function(){
		return {
			replies: []
		};
	},
	handleReplyClick: function(obj){
		console.log("handleReplyClick");
		
		var data = this.state.replies.slice();
		console.log(data);
		var index = 0;

		data.map(function(d){

			if(d.key==obj.id){
				data.splice(index,1);
				this.setState({replies:data});
			}
			index++;

		}.bind(this));
	},
	componentWillMount: function(){
		var allReplies = [];
		this.props.comments.map(function(com){
			allReplies.push(<Comment data={com} onDelete={this.handleReplyClick} key={com.id} loggedInID={this.props.loggedInID} />);
		}.bind(this));

		this.setState({replies:allReplies});
	},
	render: function(){

		return (
			<div className="comments-replies-holder">
				{this.state.replies}
			</div>
		);
	}
});

var Discussion = React.createClass({
	getInitialState: function(){
		return {
			showComments: false,
			showAuthorDetails: false
		};
	},
	showDetails: function(){
		 this.setState({ showComments: !this.state.showComments });
	},
	render: function(){

		return (
	        <section className="discussion">
	        	<h1 className="discussion-title">{this.props.topic.title}</h1>
	        	<button className="button-show-comments" onClick={this.showDetails} >Show</button>
	        	{ this.state.showComments ? <CommentList comments={this.props.topic.comments} loggedInID={this.props.loggedInID} /> : null }
	        </section>
	      );
	}
});

var CommentArea = React.createClass({
	getInitialState: function(){
		return {topics:[]};
	},
	componentDidMount: function() {

		$.get(this.props.url, function(data){

			if(this.isMounted()){
				this.setState({topics:data});
			}
		}.bind(this));
	},
	render: function(){
		var discussions = [];

		this.state.topics.forEach(function(top){
			discussions.push(<Discussion topic={top.discussion} key={top.discussion.id} loggedInID={this.props.loggedInID} />);
		}.bind(this));

		return (
			<div className="comment-area">{discussions}</div>
		);
	}
});


var Main = React.createClass({
	render: function(){

		return (
			<div className="container">
				<header>Today's Topics</header>
				<CommentArea loggedInID={this.props.loggedInID} url={"../comments.json"} />
			</div>
		);
	}
});

ReactDOM.render(<Main loggedInID={2} />,document.getElementById('app'));
