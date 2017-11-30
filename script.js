// initialize Firebase
// Initialize Firebase
  var config = {
    apiKey: "AIzaSyCBX49sG9PgFJ0322JM-o74Eg1BLs0XxEA",
    authDomain: "dgj-hackathon.firebaseapp.com",
    databaseURL: "https://dgj-hackathon.firebaseio.com",
    projectId: "dgj-hackathon",
    storageBucket: "dgj-hackathon.appspot.com",
    messagingSenderId: "454176218887"
  };
  firebase.initializeApp(config);

$(document).ready(function() {
	// set default news source to load for logged-out users
	getNews("techcrunch")

	// modal toggling
	$("#signup-toggle").click(function() {
		$("#modal-signup").show()
		$(".page").show()
	})

	$("#login-toggle").click(function() {
		$("#modal-login").show()
		$(".page").show()
	})

	$(".modal-close").click(function() {
		$(".modal").hide()
		$(".page").hide()
	})

	// news source toggling
	$(".title-link").click(function() {
		getNews($(this).attr("id"), isLoggedIn)
	})

	// set global variable for logged-in state
	var isLoggedIn = false

	// detects auth state changes
	firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		$("#title-buttons-logged-out").hide()
		$("#title-buttons-logged-in").show()
		isLoggedIn = true
	} else {
		$("#title-buttons-logged-out").show()
		$("#title-buttons-logged-in").hide()
		isLoggedIn = false
	}

	// always load this news source first
	getNews("recode", isLoggedIn)
})

	// signup
	$("#signup").click(function() {
	var email = $("#signup-email").val()
	var password = $("#signup-password").val()
	firebase.auth().createUserWithEmailAndPassword(email, password)
	.then(function() {
		$(".modal").hide()
		$(".page").hide()
		firebase.auth().signInWithEmailAndPassword(email, password)
	})
	.catch(function(error) {
		var errorCode = error.code
		var errorMessage = error.message
		$("#signup-error").html(errorMessage)
	})
})

	// login
	/$("#login").click(function() {
	var email = $("#login-email").val()
	var password = $("#login-password").val()
	firebase.auth().signInWithEmailAndPassword(email, password)
	.then(function() {
		$(".modal").hide()
		$(".page").hide()
	})
	.catch(function(error) {
		var errorCode = error.code;
		var errorMessage = error.message;
		$("#login-error").html(errorMessage)
	})
})

	// logout
	/$("#logout").click(function() {
	firebase.auth().signOut().then(function() {
		location.reload()
	})
})

	// function to get news articles from a specific source
	function getNews(source, isLoggedIn) {
		// paste your API key from https://newsapi.org/account after "apiKey="
		var url = "https://newsapi.org/v1/articles?source=" + source + "&apiKey=ad46b3d0c09e422595dc6238a937be57"
		$.getJSON(url, function(data) {
			console.log(data)

	$(".container").html('')    // clear existing articles
	$(".title-link").css('text-decoration', 'none')
	$("#" + source).css('text-decoration', 'underline')     // underline the source link

	for (var i = 0; i < data.articles.length; i++) {
		var article = data.articles[i]

	$( "<div></div>", {
		id: "article-container-" + i,
		class: "article-container",
		style: "background-image: url(" + article.urlToImage + ")",
	}).appendTo($(".container"))
	
	$("#article-container-" + i).bind("click", { url: article.url }, function(e) {
		window.open(e.data.url)
	})

	$( "<div></div>", {
		class: "article-text",
	}).appendTo($("#article-container-" + i))
	
	$( "<div></div>", {
		class: "article-title",
		text: article.title
	}).appendTo($("#article-container-" + i + " .article-text"));

	$( "<div></div>", {
		class: "article-datetime",
		text: moment(article.publishedAt).format("MMMM Do YYYY, h:mm:ss a")
	}).appendTo($("#article-container-" + i + " .article-text"))

	if (isLoggedIn) {
		$( "<div></div>", {
			class: "slack-button",
			id: "slack-button-" + i,
			text: "Send to Slack",
		}).appendTo($("#article-container-" + i))

		$("#slack-button-" + i).bind("click", {
			source: source,
			article: article
		}, function(e) {
			e.preventDefault()
			e.stopPropagation()
			var source = e.data.source
			var article = e.data.article
			sendToSlack(source, article.title, article.description, article.url, article.urlToImage)
		})
	}
}

		})
	}

	// function to send Slack message about article
	// [ insert sendToSlack() function here ]

	function sendToSlack(source, articleTitle, articleText, articleUrl, articleUrlToImage) {
	var payload = {
		"attachments": [{
			"fallback": articleTitle,
			"color": "#36a64f",
			"author_name": source,
			"title": articleTitle,
			"title_link": articleUrl,
			"text": articleText,
			"image_url": articleUrlToImage
		}]
	}

	// paste your Slack webhook URL into the quotes below
	var url = 'https://hooks.slack.com/services/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'

	$.post(url, {
		payload: JSON.stringify(payload),
	}, function(data){
        alert("Sent to Slack!")
	})
}
})