/*!
 * Notepad5 v1.06
 * https://github.com/uddhabh/Notepad5
 * By Uddhab Haldar (http://uddhab.me.pn/)
 */

(function() {
  "use strict";

  function $(id) { // shortcut for document.getElementById
    return document.getElementById(id);
  }

  // core variables
  var customStyle = $("custom-style"),
    textarea = $("textarea"),
    statusBar = $("status-bar"),
    fileInput = $("file-input"),
    appname = "Notepad5",
    isModified,
    filename;

  function skipSaving() { // warning for saving doc
    if (!isModified || !textarea.value || confirm("You have unsaved changes that will be lost.")) {
      isModified = false;
      return true;
    }
  }

  function changeFilename(newFilename) {
    filename = newFilename || "untitled.txt";
    document.title = filename + " - " + appname;
  }

  function updateStatusBar() { // text stats
    var text = textarea.value;
    statusBar.value = "Words: " + (text.split(/\w+/).length - 1) +
      "  Characters: " + text.replace(/\s/g, "").length + " / " + text.length;
  }

  function newDoc(text, newFilename) {
    if (skipSaving()) {
      textarea.value = text || "";
      changeFilename(newFilename); // default "untitled.txt"
      updateStatusBar();
    }
  }

  function openDoc(event) {
    var files = event.target.files || event.dataTransfer.files,
      file = files[0],
      reader = new FileReader();
    if (file) {
      event.preventDefault();
      reader.addEventListener("load", function(event) {
        newDoc(event.target.result, file.name);
      });
      reader.readAsText(file);
    }
  }

  function saveDoc() {
    var newFilename = prompt("Name this document:", filename);
    if (newFilename !== null) {
      if (newFilename === "") {
        changeFilename(); // "untitled.txt"
      } else {
        changeFilename(/\.txt$/i.test(newFilename) ? newFilename : newFilename + ".txt");
      }
      var blob = new Blob([textarea.value.replace(/\n/g, "\r\n")], {
        type: "text/plain;charset=utf-8"
      }); // line ending CRLF
      saveAs(blob, filename);
      isModified = false;
    }
  }

  function showHideStatusBar(on) {
    statusBar.hidden = !on; // true/false
    textarea.className = on ? "statusBarOn" : "";
  }

  function toggleFullScreen() {
    var elem = document.documentElement,
      request = elem.requestFullscreen || elem.msRequestFullscreen || elem.mozRequestFullScreen || elem.webkitRequestFullscreen,
      exit = document.exitFullscreen || document.msExitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen;
    if (!document.fullscreenElement && !document.msFullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
      request.call(elem);
    } else {
      exit.call(document);
    }
  }

  function addCSS(rules) {
    rules = rules || prompt("Add custom CSS here:", customStyle.innerHTML);
    if (rules !== null) {
      customStyle.innerHTML = rules;
    }
  }

  function storeData() {
    var appdata = {
      filename: filename,
      text: textarea.value,
      isModified: isModified,
      statusBarOn: !statusBar.hidden,
      customCSS: customStyle.innerHTML
    };
    localStorage.setItem("appdata", JSON.stringify(appdata));
  }

  function init() {
    document.body.className = ""; // make the app visible
    if (navigator.userAgent.match(/Mobi/)) { // likely mobile
      document.body.innerHTML = "I think this webapp isn't useful on mobile... sorry :(";
      return; // end
    }
    if (!window.File) { // likely unsupported browser
      document.body.innerHTML = "<p>Sorry your browser isn't supported :(<br>Please upgrade to <a href='http://google.com/chrome'>Google Chrome</a>.</p>";
      return; // end
    }
    var appdata = JSON.parse(localStorage.getItem("appdata"));
    showHideStatusBar(!appdata || appdata.statusBarOn); // show by default
    if (appdata) {
      if (appdata.customCSS) {
        addCSS(appdata.customCSS);
      }
      if (appdata.isModified) {
        newDoc(appdata.text, appdata.filename);
        isModified = true;
      } else {
        newDoc(); // blank note
      }
    } else { // first run
      newDoc(["Welcome to " + appname + ", the online-offline notepad. All of your text is stored offline on your computer. Nothing is stored on servers.",
        "\nHere are some useful keyboard shortcuts:",
        "Ctrl + R : Create New Document",
        "Ctrl + O : Open Document",
        "Ctrl + S : Save Document",
        "Ctrl + B : Toggle Status Bar",
        "Ctrl + E : Add Custom CSS",
        "Ctrl + Enter : Toggle Full Screen",
        "\nYou can contact me at:",
        "uddhab.me@gmail.com or twitter.com/uddhabh"
      ].join("\n"), "Welcome!");
    }
  }

  fileInput.addEventListener("change", openDoc);

  textarea.addEventListener("blur", function() { // keep textarea focused
    setTimeout(function() {
      textarea.focus();
    }, 0);
  });
  textarea.addEventListener("input", function() {
    isModified = true;
    updateStatusBar();
  });
  textarea.addEventListener("keydown", function(event) {
    if (event.keyCode == 9) { // Tab: insert tab
      event.preventDefault();
      var text = textarea.value,
        sStart = textarea.selectionStart;
      textarea.value = text.substring(0, sStart) + "\t" + text.substring(textarea.selectionEnd);
      textarea.selectionEnd = sStart + 1;
    }
  });

  document.addEventListener("keydown", function(event) {
    var keys = {
      13: toggleFullScreen, // Enter: toggle fullscreen
      66: function() { // B: toggle statusBar
        showHideStatusBar(statusBar.hidden);
      },
      69: addCSS, // E: add custom CSS
      79: function() { // O: open
        if (skipSaving()) fileInput.click();
      },
      82: newDoc, // R: new
      83: saveDoc // S: save
    };
    if (event.ctrlKey && keys[event.keyCode]) { // Ctrl + keys{}
      event.preventDefault();
      keys[event.keyCode]();
    }
  });
  document.addEventListener("drop", openDoc);

  window.addEventListener("load", init); // initialize
  window.addEventListener("unload", storeData); // store appdata locally

}());
