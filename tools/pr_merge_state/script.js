let body
let pulls = [];
let requests_open = 0;
let assembled_info = [];

function init(){
	body = document.getElementsByTagName('body')[0];
	body.innerHTML += '<h1>Suffragium pull requst overview</h1>';
	fetch_api('https://api.github.com/repos/letsgamedev/Suffragium/pulls', callback_api_pulls);
}

function fetch_api(url, callback, params){
	let request = new XMLHttpRequest();
	request.onload = callback;
	request.params = params;
	request.open('get', url, true);
	request.send();
	requests_open += 1;
}

function callback_api_pulls() {
	pulls = JSON.parse(this.responseText);
	for (i = 0; i < pulls.length; i++){
		let pull = pulls[i];
		fetch_api(pull.issue_url, callback_api_pull_issue, {index: i});
		fetch_api(pull.commits_url, callback_api_pull_commits, {index: i});
	}
	callback_finished();
}

function callback_api_pull_issue(){
	let pull_issue = JSON.parse(this.responseText);
	let index = this.params.index;
	pulls[index].issue_data = pull_issue;
	callback_finished();
}

function callback_api_pull_commits(){
	let pull_commits = JSON.parse(this.responseText);
	let index = this.params.index;
	pulls[index].commits_data = pull_commits;
	callback_finished();
}

function callback_finished(){
	requests_open -= 1;
	if(requests_open === 0){
		assemble_info();
	}
}

function assemble_info(){
	let info = [];
	for(i = 0; i < pulls.length; i++){
		let pull = pulls[i];
		let reactions = pull.issue_data.reactions;
		let commits_data = pull.commits_data;
		info[i] = {};
		info[i].title = pull.title;
		info[i].votes = {'+1': reactions['+1'], '-1': reactions['-1']};
		info[i].last_commit_time = commits_data[commits_data.length - 1].commit.committer.date;
		info[i].url = pull.url;
	}
	console.log(info);
	assembled_info = info;
	display();
}

function display(){
	for(i = 0; i < assembled_info.length; i++){
		let pull = assembled_info[i];
		let html = '';
		html += '<div class="pr_box"><h3>' + pull.title + '</h3>';
		// url is not to the pr on github, but the api …
		//body.innerHTML += '<p>' + pull.url + '</p>';
		let last_commit_unix_ms = Date.parse(pull.last_commit_time);
		let now_unix_ms = Date.now();
		let time_difference_ms = now_unix_ms - last_commit_unix_ms;
		let last_commit_days = calculate_days(time_difference_ms);
		html += '<p>last commit: ' + last_commit_days + ' days ago</p>';
		let votes_up = pull.votes['+1'];
		let votes_down = pull.votes['-1'];
		let vote_count = votes_up + votes_down;
		html += '<p>';
		for(k = 0; k < votes_up; k++){
			// thumb up/down is harder to see at a glance (color difference)
			//body.innerHTML += '👍';
			html += '🟩';
		}
		for(l = 0; l < votes_down; l++){
			//body.innerHTML += '👎';
			html += '🟥';
		}
		let percentage = 0;
		if(vote_count > 0){
			percentage = Math.round(votes_up / vote_count * 1000) / 10;
		}
		html += ' ' + percentage + '% (' + vote_count + ' votes)</p>';
		html += '<div class="status_div"><span>status: </span>' + get_status(votes_up, votes_down, last_commit_days) + '</div></div><br>';
		body.innerHTML += html;
	}
}

function calculate_days(time_ms){
	let seconds = time_ms / 1000;
	let minutes = seconds / 60;
	let hours = minutes / 60;
	let days = Math.round(hours / 24 * 100) / 100;
	return days;
}

function get_status(votes_up, votes_down, last_commit_days){
	let vote_count = votes_up + votes_down;
	let positive_votes = votes_up / vote_count;
	if(last_commit_days >= 1 && vote_count > 10 && positive_votes >= 0.75){
		return '<p class="status status_merge">MERGE</p>';
	}
	if(last_commit_days >= 3 && positive_votes >= 0.75){
		return '<p class="status status_merge">MERGE</p>';
	}
	if(last_commit_days > 30){
		return '<p class="status status_delete">DELETE</p>';
	}
	return '<p class="status status_active">active</p>';
