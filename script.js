// Title: Simon Says
// Author: Eddie Liu
// Simon Says game for Free Code Camp

$(document).ready(function(){
   var Game = function() {
      var that = this;
      this.power = false;
      this.strict = false;
      this.sequence = [];
      this.playerTurn = false;
      this.playerSequence = [];

      var audioElement = document.createElement('audio');

      // Toggle game power On/Off
      this.switchPower = function() {
         this.power = !this.power;
         if (!this.power) {
            this.strict = false;
            this.sequence = [];
            this.updateCount();
         }
      }

      // Start a New Game
      this.startGame = function() {
         if (this.power) {
            this.playerTurn = false;
            this.sequence = [];
            this.checkTurn();
         }
      }

      // Toggles Strict Mode On/Off
      this.strictModeToggle = function() {
         if (this.power) {
            this.strict = !this.strict;
         }
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
         if (!id) {
            audioElement.setAttribute('src', 'sounds/wrong.mp3');
         } else {
            audioElement.setAttribute('src', 'sounds/simonSound' + id + '.mp3');
         }
         audioElement.play();
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
               console.log('WRONG ANSWER');
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

   var game = new Game();

   $('#gameStartButton').on('click', function() {
      game.startGame();
   });

   $('#powerswitch').on('click', function() {
      if ($(this).hasClass('on')) {
         $(this).removeClass('on');
         $('#strictMode').removeClass('on');
         $('#game').removeClass('on');
      } else {
         $(this).addClass('on');
         $('#game').addClass('on');
      }
      game.switchPower();
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
      if (game.playerTurn && game.power) {
         game.playerSays($(this));
      }
   });
});