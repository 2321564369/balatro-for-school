<!DOCTYPE html>
<html lang="en-us">
<head>
<meta charset="utf-8">
<title>Balatro Game</title>
<style>
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: #000;
  }
  canvas { display: block; width: 100%; height: 100%; }
</style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <canvas id="loadingCanvas" width="800" height="600"></canvas>

  <script src="love.js"></script>
  <script src="consolewrapper.js"></script>
  <script src="game.js"></script>

  <!-- --- PATCHED Save & Collections Hooks --- -->
  <script>
    (function() {
      // Save/Restore collections
      function getCollections() {
        try { return JSON.parse(localStorage.getItem("balatro_collections")||"{}"); } catch(e){ return {}; }
      }
      function setCollections(data) { localStorage.setItem("balatro_collections", JSON.stringify(data)); }

      window.addEventListener("message", (event) => {
        if(event.data.type === "REQUEST_SAVE") {
          // send game progress
          const progress = (typeof Module !== 'undefined' && Module.LOVE && Module.LOVE.saveData) ? Module.LOVE.saveData() : {};
          window.parent.postMessage({ type:"GAME_SAVE", payload: progress }, "*");
        }
        if(event.data.type === "RESTORE_SAVE") {
          if(typeof Module !== 'undefined' && Module.LOVE && Module.LOVE.loadData) {
            Module.LOVE.loadData(event.data.payload);
          }
        }
        if(event.data.type === "REQUEST_COLLECTIONS") {
          window.parent.postMessage({ type:"COLLECTIONS_DATA", payload: getCollections() }, "*");
        }
        if(event.data.type === "RESTORE_COLLECTIONS") {
          setCollections(event.data.payload || {});
        }
      });

      // Hook localStorage to notify parent when collections change
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function(key, value) {
        originalSetItem.apply(this, arguments);
        if(key === "balatro_collections") {
          try {
            const data = JSON.parse(value);
            window.parent.postMessage({ type:"COLLECTIONS_UPDATE", payload:data }, "*");
          } catch(e){}
        }
      };
    })();
  </script>
</body>
</html>
