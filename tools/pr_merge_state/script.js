let body
let pulls = [];
let requests_open = 0;
let assembled_info = [];

function init() {
	body = document.body
	fetch_api('https://api.github.com/repos/letsgamedev/Suffragium/pulls', callback_api_pulls);
}

function fetch_api(url, callback, params) {
	let request = new XMLHttpRequest();
	request.onload = callback;
	request.params = params;
	request.open('get', url, true);
	request.send();
	requests_open += 1;
}

function callback_api_pulls() {
	pulls = JSON.parse(this.responseText);
	for (i = 0; i < pulls.length; i++) {
		let pull = pulls[i];
		fetch_api(pull.issue_url, callback_api_pull_issue, { index: i });
		fetch_api(pull.commits_url, callback_api_pull_commits, { index: i });
	}
	callback_finished();
}

function callback_api_pull_issue() {
	let pull_issue = JSON.parse(this.responseText);
	let index = this.params.index;
	pulls[index].issue_data = pull_issue;
	callback_finished();
}

function callback_api_pull_commits() {
	let pull_commits = JSON.parse(this.responseText);
	let index = this.params.index;
	pulls[index].commits_data = pull_commits;
	callback_finished();
}

function callback_finished() {
	requests_open -= 1;
	if (requests_open === 0) {
		assemble_info();
	}
}

function assemble_info() {
	let info = [];
	for (i = 0; i < pulls.length; i++) {
		let pull = pulls[i];
		let reactions = pull.issue_data.reactions;
		let commits_data = pull.commits_data;
		info[i] = {};
		info[i].title = pull.title;
		info[i].draft = pull.draft;
		info[i].votes = { '+1': reactions['+1'], '-1': reactions['-1'] };
		info[i].last_commit_time = commits_data[commits_data.length - 1].commit.committer.date;
		info[i].url = "https://github.com/letsgamedev/Suffragium/pull/" + pull.number;
	}

	// add mockup_entrys
	// info.push(mockup_entry("mockup active", false, [0, 0], "2022-06-30T16:37:44Z", "https://github.com/letsgamedev/Suffragium/"));
	// info.push(mockup_entry("mockup inactive", false, [0, 0], "2022-03-30T16:37:44Z", "https://github.com/letsgamedev/Suffragium/"));
	// info.push(mockup_entry("mockup has votes", false, [10, 0], "2022-03-30T16:37:44Z", "https://github.com/letsgamedev/Suffragium/"));
	// info.push(mockup_entry("mockup draft inactive", true, [0, 0], "2022-06-30T16:37:44Z", "https://github.com/letsgamedev/Suffragium/"));
	// info.push(mockup_entry("mockup draft has votes", true, [10, 0], "2022-03-30T16:37:44Z", "https://github.com/letsgamedev/Suffragium/"));

	console.log(info);
	assembled_info = info;
	display();
}

function mockup_entry(title, draft, votes, last_commit_time, url) {
	let entry = {};
	entry.title = title;
	entry.draft = draft;
	entry.votes = { '+1': votes[0], '-1': votes[1] };
	entry.last_commit_time = last_commit_time;
	entry.url = url;
	return entry;
}

function display() {
	for (i = 0; i < assembled_info.length; i++) {
		let pull = assembled_info[i];
		// Time
		let last_commit_unix_ms = Date.parse(pull.last_commit_time);
		let now_unix_ms = Date.now();
		let time_difference_ms = now_unix_ms - last_commit_unix_ms;
		let last_commit_days = calculate_days(time_difference_ms);
		// Votes
		let votes_up = pull.votes['+1'];
		let votes_down = pull.votes['-1'];
		let vote_count = votes_up + votes_down;
		percentage = Math.round(votes_up / vote_count * 1000) / 10;
		// Build
		let html_draft_class = ""
		let html_draft_title = ""
		if (pull.draft) {
			html_draft_class = " pr_draft"
			html_draft_title = "Draft: "
		}
		let html_vote_percent = ""
		if (!isNaN(percentage)) {
			html_vote_percent = ' (' + percentage + '%) '
		}

		let html_begin = '<a href=' + pull.url + '><div class="pr_outer_box' + get_status(votes_up, votes_down, last_commit_days) + '"><div class="pr_box' + html_draft_class + '">';
		let html_title = '<h3>' + html_draft_title + pull.title + '</h3>';
		let html_votes = '<span>👍 ' + pull.votes['+1'] + ' 👎 ' + pull.votes['-1'] + html_vote_percent + '</span>';
		let html_last_commit = '<span>last commit: ' + last_commit_days + ' days ago</span>';
		let html_end = '</div></div></a>';
		let html = html_begin + html_title + html_votes + html_last_commit + html_end;
		body.innerHTML += html;
	}
}

function calculate_days(time_ms) {
	let seconds = time_ms / 1000;
	let minutes = seconds / 60;
	let hours = minutes / 60;
	let days = Math.round(hours / 24 * 100) / 100;
	return days;
}

function get_status(votes_up, votes_down, last_commit_days) {
	let vote_count = votes_up + votes_down;
	let positive_votes = votes_up / vote_count;
	if (last_commit_days >= 1 && vote_count > 10 && positive_votes >= 0.75) {
		return " status_merge";
	}
	if (last_commit_days >= 3 && positive_votes >= 0.75) {
		return " status_merge";
	}
	if (last_commit_days > 30) {
		return " status_delete";
	}
	return "";
}
