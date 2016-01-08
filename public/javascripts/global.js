//SETTING UP SOME GLOBAL VALUES==============================================
//Make an empty array to fill in quotes later
var quoteListData = [];

//The maximum value of characters in the text field
var max = 400;

//STARTING THE ACTUAL MAGIC==================================================
//When the document is ready, fire up this function
$(document).ready(function(){

  //Add a date picker to the date entry field, which is restricted to
  //dates from today and earlier (no future dates)
  $('#inputDate').datepicker({maxDate: new Date});

  //Add an event handler for the save quote button
  $('#inputButton').on('click', addQuote);

  //Add an event handler for the delete quote buttons
  $('#quoteList').on('click', 'td a.linkdeletequote', deleteQuote);

  //Add an event handler for searching author button
  $('#searchAuthor').on('click', searchAuthor);

  //Add an event handler for the reset button
  $('#reset').on('click', showQuote);

  //Start the track character function
  trackChar();

  //Show all currently stored quotes by default
  showQuote();

});

//THIS IS THE MAGIC CONTAINER================================================
//Keeping track of the amount of characters in the textarea
function trackChar(){

  $('#charCounter').append(max);

  //Defining the text area from which to count
  $('#inputQuote').keyup(function(){
    $('#charCounter').empty();

    var length = $(this).val().length;

    //Calculating and showing the amount of characters left
    var char = max - length;
    $('#charCounter').append(char);
  });
};

//The quote creation function
function showQuote(){

  //Calling JSON information from our database
  $.getJSON('/quotes/quotelist', function(data){

    //A string placeholder for easier html parsing
    var quoteContent = '';

    //Put the JSON item into an array of all quotes
    quoteListData = data;

    //Check if there are quotes stored and give an error
    //if there are none
    if (quoteListData.length === 0){
      $('#quoteList').html('<p>Oops, there are no quotes yet!</p>');
    } else { //If there are quotes, display them

      //For each item, create a table row with the quote,
      //and another row with the author and date of submission.
      $.each(data,function(){

        //Building up the table in small blocks
        quoteContent += '<table id="quoteTable">';
        quoteContent += '<tbody>';
        quoteContent += '<tr>';
        quoteContent += '<td colspan="2" id="quote">"' + this.quote + '"</td>';
        quoteContent += '<td rowspan="2" id="deleteQuote"><a href="#" class="linkdeletequote" rel="' + this._id + '">x</a></td>';
        quoteContent += '</tr>';
        quoteContent += '<tr>';
        quoteContent += '<td id="author">' + this.author + '</td>';
        quoteContent += '<td id="date">' + this.date + '</td>';
        quoteContent += '</tr>';
        quoteContent += '</tbody>';
        quoteContent += '</table>';
      });

      //Putting the entire string into our index page
      $('#quoteList').html(quoteContent);
    }
  });
};

//The function that adds the defined quote to the database
function addQuote(){

  //Validate whether the quote field is not empty
  var errorCount = 0;

  if ($('#inputQuote').val() === '' ) {
    errorCount++;
  }

  //Check whether the errorcount is still zero
  if(errorCount === 0) {

    //SENDING QUOTE=========================================================
    //Give standard values for author and date
    //if they are empty
    if ($('#inputAuthor').val() === '') {
      $('#inputAuthor:text').val('Unknown');
    }
    if ($('#inputDate').val() === '') {
      $('#inputDate:text').val('Unknown');
    }

    //Start creating a new quote object
    var newQuote = {
      'quote': $('#inputQuote').val(),
      'author': $('#inputAuthor').val(),
      'date': $('#inputDate').val()
    }

    //post this new object to the add quote route
    $.ajax({
      type: 'POST',
      data: newQuote,
      url: '/quotes/addquote',
      dataType: 'JSON'
    }).done(function(response){

      //Check for the blank response indicating success
      if (response.msg === ''){

        //Clear the form inputs
        $('#quoteInput fieldset textarea').val('');
        $('#quoteInput fieldset input').val('');

        //Clear the character count
        $('#charCounter').empty();
        $('#charCounter').append(max);

        //Show the new quote together with the old ones
        showQuote();

      } else { //If no blank response came back

        alert('Error '+ response.msg);

      }
    });

  } else { //If the errorcount is non-zero, return an error
    alert('Please fill in a quote!');

    //Clear the form inputs
    $('#quoteInput fieldset textarea').val('');
    $('#quoteInput fieldset input').val('');

    return false;
  }
};

//The function that deletes the chosen quote from the database
function deleteQuote(event){

  //Give the user a final heads up: are you sure?
  var confirmation = confirm('Are you sure this quote is not cool enough?');

  //Only proceed when the user accepts the confirmation
  if (confirmation === true) {

    //If yes, then delete
    $.ajax({
      type: 'DELETE',
      url: '/quotes/deletequote/' + $(this).attr('rel')
    }).done(function( response ) {

      //Check whether the delete was successful
      if (response.msg === '') {
      } else {
        alert('Error: ' + response.msg);
      }

      //Update te database
      showQuote();

    });
  }
  else {

    //If the delete was pressed by accident and confirm was no
    return false;
  }
};

//The function that searches for a certain author
function searchAuthor(){

  //A variable to track if there are quotes Found
  var found = 0;

  //A variable to store the author in uppercase
  var authorToCheck = $('#quoteAuthor').val().toUpperCase();

  //A string variable to store the final html
  var quoteContent = '';

  //Emptying the text field
  $('#quoteAuthor').val('');

  //Retrieving the data from the database
  $.getJSON('/quotes/quotelist', function(data){

    //For each part of the data, start the checker
    $.each(data, function(){

      //Check whether the specified author exists in the database
      if (this.author.toUpperCase() === authorToCheck ) {

        //For each item, create a table row with the quote,
        //and another row with the author and date of submission.

        //Building up the table in small blocks
        quoteContent += '<table id="quoteTable">';
        quoteContent += '<tbody>';
        quoteContent += '<tr>';
        quoteContent += '<td colspan="2" id="quote">"' + this.quote + '"</td>';
        quoteContent += '<td rowspan="2" id="deleteQuote"><a href="#" class="linkdeletequote" rel="' + this._id + '">x</a></td>';
        quoteContent += '</tr>';
        quoteContent += '<tr>';
        quoteContent += '<td id="author">' + this.author + '</td>';
        quoteContent += '<td id="date">' + this.date + '</td>';
        quoteContent += '</tr>';
        quoteContent += '</tbody>';
        quoteContent += '</table>';

        found = found+1;
      }

    });

    //To check whether there are found authors or not
    if (found === 0){

      //If there are none, append a string of text
      $('#quoteList').html('<p>Uh oh, this author does not exist yet!</p>');
    } else {

      //Putting the entire string into our index page
      $('#quoteList').html(quoteContent);
    }
  });
};
