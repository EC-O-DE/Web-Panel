/* This will be loaded each time the user visits a new page, like clicking
a link. Then it will send the current url to the panel.js script. */

// Check if the window doesn't have a parent and if that is toplevel,
// otherwise this is not the sidebar:
if (window !== window.top && window.parent === window.top)
{
    chrome.runtime.sendMessage({msg: 'isSideBar'}, function(response)
	{
        isSideBar(); // If we receive a respond, we know this is the sidebar
    });
}

// Check if the window doen't have a parent and if that is toplevel,
// so that we know that it comes from the sidebar:
function isSideBar()
{
    if (location.href.indexOf("://facebook.com") !== -1 || location.href.indexOf("://m.facebook.com") !== -1)
        facebookPatch();
	if (location.href.indexOf("://github.com") !== -1)
        githubPatch();

    var url = document.URL;

    // Send the current site immediately when the page is loaded:
    chrome.runtime.sendMessage({msg: 'newLink', link: url});

    // And regularly check if the url changes, then send it again:
    setInterval(function()
    {
        if (document.URL !== url)
		{
            url = document.URL;
			chrome.runtime.sendMessage({msg: 'newLink', link: url}, function(response)
			{
				if (typeof response !== 'undefined')
					handleReceivedLink(response);
			});
        }
    }, 500);

	var port = chrome.runtime.connect({name: "zoom"});
	port.onMessage.addListener(handleMessage);
}

function handleMessage(message)
{
	document.body.style.zoom = message.zoomValue + '%';
}

function facebookPatch()
{
	// Try to remove the stylesheet in the html code that blocks the page

    var elemRemoved = false;
    var attempts = 0;

    var interval = setInterval(function()
    {
        if (document.body !== null && document.body.querySelector("style") !== null)
        {
            document.body.querySelector("style").remove();
            elemRemoved = true;
        }
        if (++attempts >= 20 || elemRemoved)
            clearInterval(interval);
    }, 500);
}

function githubPatch()
{
	// Github warns about framing via alert, so we remove alert completely
	var el = document.createElement("script");
    el.textContent = "window.alert = function(msg) { console.log('Alert: ' + msg) };";
    document.documentElement.insertBefore(el, document.documentElement.firstChild);
}
