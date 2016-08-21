/*!
 * Notepad5 v1.5
 * https://github.com/uddhabh/Notepad5
 * By Uddhab Haldar (http://uddhab.me/)
 */

$(function() {

  // core variables
  var customStyle = $("#custom-style"),
    textarea = $("#textarea"),
    statusBar = $("#status-bar"),
    fileInput = $("#file-input"),
    appname = "Notepad5",
    isModified,
    filename;

  function skipSaving() { // warning for saving doc
    if (!isModified || !textarea.value ||
      confirm("You have unsaved changes that will be lost.")) {
      isModified = false;
      return true;
    }
  }

  function changeFilename(newFilename) {
    filename = newFilename || "untitled.txt";
    document.title = filename + " - " + appname;
  }

  function updateStatusBar() { // text stats
    var text = textarea.val();
    statusBar.val(
      "Words: " + (text.split(/\w+/).length - 1) +
      "  Characters: " + text.replace(/\s/g, "").length + " / " + text.length
    );
  }

  function newDoc(text, newFilename) {
    console.log("test");
    if (skipSaving()) {
      textarea.value = text || "";
      changeFilename(newFilename); // default "untitled.txt"
      updateStatusBar();
    }
  }

  function openDoc(e) {
    var files = e.target.files || e.dataTransfer.files,
      file = files[0],
      reader = new FileReader();
    if (file) {
      e.preventDefault();
      reader.on("load", function(e) {
        newDoc(e.target.result, file.name);
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
        changeFilename(/\.txt$/i.test(newFilename) ? newFilename :
          newFilename + ".txt");
      }
      var blob = new Blob([textarea.val().replace(/\n/g, "\r\n")], {
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
      request = elem.requestFullscreen || elem.msRequestFullscreen ||
      elem.mozRequestFullScreen || elem.webkitRequestFullscreen,
      exit = document.exitFullscreen || document.msExitFullscreen ||
      document.mozCancelFullScreen || document.webkitExitFullscreen;
    if (!document.fullscreenElement && !document.msFullscreenElement &&
      !document.mozFullScreenElement && !document.webkitFullscreenElement) {
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
    $("body").removeClass("loading"); // make the app visible
    if (!window.File) { // likely unsupported browser
      document.body.innerHTML =
        "<h2>Sorry your browser isn't supported :(</h2>";
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
      newDoc(["Welcome to " + appname + ", the online-offline notepad." +
        " All of your text is stored offline on your computer." +
        " Nothing is stored on servers.",
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

  fileInput.on("change", openDoc);

  textarea.on("blur", function() { // keep textarea focused
    setTimeout(function() {
      textarea.focus();
    }, 0);
  });
  textarea.on("input", function() {
    isModified = true;
    updateStatusBar();
  });
  textarea.on("keydown", function(e) {
    if (e.keyCode == 9) { // Tab: insert tab
      e.preventDefault();
      var text = this.value,
        sStart = this.selectionStart;
      this.value = text.substring(0, sStart) + "\t" +
        text.substring(this.selectionEnd);
      this.selectionEnd = sStart + 1;
    }
  });

  Mousetrap.bind('mod+s', function(e) {
    e.preventDefault();
    saveDoc();
  })
  Mousetrap.bind('mod+n', function(e) {
    e.preventDefault();
    newDoc();
  })
  Mousetrap.bind('mod+b', function(e) {
    e.preventDefault();
    showHideStatusBar(statusBar.hidden);
  })
  Mousetrap.bind('mod+e', function(e) {
    e.preventDefault();
    addCSS();
  })
  Mousetrap.bind('mod+o', function(e) {
    e.preventDefault();
    if (skipSaving()) fileInput.click();
  })


  $(document).on("drop", openDoc);

  $(window).on("load", init); // initialize
  $(window).on("unload", storeData); // store appdata locally

});
