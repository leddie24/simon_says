// Title: Simon Says
// Author: Eddie Liu
// Simon Says game for Free Code Camp

$(document).ready(function(){
   function loaded(blob_uri) {
      var audio = new Audio(blob_uri);
      sp.sounds.push(audio);
   }

   function prefetch_file(url,
                          fetched_callback,
                          progress_callback,
                          error_callback) {
     var xhr = new XMLHttpRequest();
     xhr.open("GET", url, true);
     xhr.responseType = "blob";

     xhr.addEventListener("load", function () {
       if (xhr.status === 200) {
         var URL = window.URL || window.webkitURL;
         var blob_url = URL.createObjectURL(xhr.response);
         fetched_callback(blob_url);
       } else {
         error_callback();
       }
     }, false);

     var prev_pc = 0;
     xhr.addEventListener("progress", function(event) {
       if (event.lengthComputable) {
         var pc = Math.round((event.loaded / event.total) * 100);
         if (pc != prev_pc) {
           prev_pc = pc;
           progress_callback(pc);
         }
       }
     });
     xhr.send();
   }


   var sounds = [1, 2, 3, 4, 'wrong'];
   for (var i = 0; i < sounds.length; i++) {
      if (sounds[i] !== 'wrong') {
         var resource = document.createElement("audio").canPlayType("audio/mp3")
                   ? "./sounds/simonSound" + sounds[i] + ".mp3" : "";
         prefetch_file(resource, loaded, function(pc) {
            console.log(pc);
         });
      } else {
         var resource = document.createElement("audio").canPlayType("audio/mp3")
                   ? "./sounds/" + sounds[i] + ".mp3" : "";
         prefetch_file(resource, loaded, function(pc) {
            console.log(pc);
         });
      }
   }

   var soundsPlayer = function() {
      this.sounds = [];
      this.playSound = function(id) {
         this.sounds[id].play();
      }
   }

   var sp = new soundsPlayer();

   var Game = function() {
      var that = this;
      this.strict = false;
      this.sequence = [];
      this.playerTurn = false;
      this.playerSequence = [];

      // Start a New Game
      this.startGame = function() {
         this.playerTurn = false;
         this.sequence = [];
         this.checkTurn();
      }

      // Toggles Strict Mode On/Off
      this.strictModeToggle = function() {
         this.strict = !this.strict;
      }

      this.clearScore = function () {
         this.sequence = [];
         this.updateCount();
      }

      // Check whose turn it is.  If it's player's, empty player sequence, else, add a step
      this.checkTurn = function() {
         if (this.playerTurn) {
            this.playerSequence = [];
         } else {
            this.addStep();
         }
      }

      // Add a Step to the Sequence
      this.addStep = function() {
         var random = Math.floor(Math.random() * 4) + 1;
         this.sequence.push(random);
         this.updateCount();
         this.doSequence();
      }

      // Iterate through Simon's Sequence
      this.doSequence = function() {
         this.lightUp(0);
         (function loopSequence (i) {          
            setTimeout(function () {
               if (i == that.sequence.length) {
                  that.playerTurn = true;
                  that.checkTurn();
               } else {
                  that.lightUp(i);
                  if (i < that.sequence.length) {
                     ++i;
                     loopSequence(i);
                  }
               }
            }, 800)
         })(1);
      }

      // Helper method to play a sound for the button click
      this.playSound = function(id) {
         if (typeof id !== 'undefined') {
            console.log(id);
            if (!id) {
               sp.playSound(4);
            } else {
               id = id - 1;
               sp.playSound(id);
            }
         }
      }

      // Helper method to light up button (and play sound)
      this.lightUp = function(id) {
         $('#b' + this.sequence[id]).addClass('beep');
         this.playSound(this.sequence[id]);
         setTimeout(function(id) {
            $('#b' + that.sequence[id]).removeClass('beep');
         }, 350, id);
      }

      // Update the counter
      this.updateCount = function() {
         if (this.sequence.length === 0) {
            $('#counter').text('- -');
         } else {
            $('#counter').text(this.sequence.length);
         }
      }

      // Method to add player input to their sequence
      this.playerSays = function(item) {
         this.playerSequence.push(parseInt($(item).attr('data-id')));

         // User clicked the wrong order
         if (!checkSequences(this)) {
            this.playSound(false);
            if (this.strict) {
               setTimeout(function() {
                  that.startGame();
               }, 800);
               return false;
            } else {
               this.playerSequence = [];
               setTimeout(function() {
                  that.doSequence();
               }, 800);
            }
         } 
         // User clicked right button
            else {
            this.playSound(parseInt($(item).attr('data-id')));
         }

         // If the player length equals sequence lenth, end turn
         if (this.playerSequence.length === this.sequence.length) {
            // Win condition.  If user gets 20 right, game ends
            if (this.playerSequence.length === 20) {
               //winner
            } else {
               // End turn, Simon's turn now
               this.playerTurn = false;
               setTimeout(function() {
                  that.checkTurn();
               }, 800);
            }
         }
      }

      // Helper function to check sequences.  Checks the last input to see if it matches Simon's sequence
      var checkSequences = function(game) {
         var last = game.playerSequence.length-1;
         if (game.playerSequence[last] !== game.sequence[last]) {
            return false;
         } else {
            return true;
         }
      }
   }

   var game; 

   $('#gameStartButton').on('click', function() {
      game.startGame();
   });

   $('#powerswitch').on('click', function() {
      if ($(this).hasClass('on')) {
         $('.on').removeClass('on');
         $('.button').removeClass('beep');
         game.clearScore();
         clearTimeout();
         clearInterval();
         game = null;
      } else {
         $(this).addClass('on');
         $('#game').addClass('on');
         game = new Game();
      }
   });

   $('#strictModeToggle').on('click', function() {
      var strictMode = $('#strictMode');
      if ($('#powerswitch').hasClass('on')) {
         if ($(strictMode).hasClass('on')) {
            $(strictMode).removeClass('on');
         } else {
            $(strictMode).addClass('on');
         }
         game.strictModeToggle();
      }
   });

   $('.button').on('click', function() {
      // if it's player's turn, input command
      if (game.playerTurn) {
         game.playerSays($(this));
      }
   });
});