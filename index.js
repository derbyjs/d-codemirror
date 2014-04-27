
module.exports = CM;
function CM() {}
CM.prototype.view = __dirname;

CM.prototype.init = function() {
  var model = this.model;
  model.setNull("options", {});
};

CM.prototype.create = function() {
  var model = this.model;
  var that = this;

  var options = model.get("options");
  var cm = this.cm = CodeMirror.fromTextArea(this.textarea, options);

  // changes in values inside the array
  model.on("change", "text", function(oldVal, newVal, passed) {
    //console.log("change data:", arguments);
    //we don't want to change the CM instance if we did the change
    if(passed.editing) return;
    if(passed.$type === "stringInsert" && passed.text) {
      that.supress = true;
      cm.replaceRange(passed.text, cm.posFromIndex(passed.index));
      that.supress = false;
      that.check();
    } else if(passed.$type == "stringRemove" && passed.howMany) {
      that.supress = true;
      var from = cm.posFromIndex(passed.index);
      var to = cm.posFromIndex(passed.howMany);
      cm.replaceRange('', from, to);
      that.supress = false;
      that.check();
    }
  })
  cm.on("change", function(cm, change) {
    if(that.supress) return;
    //console.log("change", change)
    var start = cm.indexFromPos(change.from);
    var end = cm.indexFromPos(change.to);
    //delete anything if needed
    if(change.removed.length > 1 || change.removed) {
      var toRemove = change.removed.join("\n");
      //console.log("toremove", toRemove, start)
      model.pass({editing: true }).stringRemove("text", start, toRemove.length)
    }
    //see if we have anything to insert
    if(change.text.length > 1 || change.text) {
      var toInsert = change.text.join("\n");
      //console.log("toinsert", toInsert, start)
      model.pass({editing: true }).stringInsert("text", start, toInsert);
    }
    that.check();
  })
};

CM.prototype.check = function() {
  var that = this;
  setTimeout(function () {
    var cmText = that.cm.getValue();
    var otText = that.model.get("text") || '';

    if (cmText != otText) {
      /*
      console.error("Text does not match!");
      console.error("cm: " + cmText);
      console.error("ot: " + otText);
      */
      // Replace the editor text with the current model value.
      that.supress = true;
      that.cm.setValue(otText);
      that.supress = false;
    }
  }, 0);
};
