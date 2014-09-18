
$(document).ready(function()
{
    console.log(document.cookie);
    if(checkIfHasCookie() === true){
        //document.location.href = 'mail.html';
    }

    $('.RegBtn').on('click',goToLogin);
    $('#Login-btn').on('click',loginButtonPressed);
    $('.LogBtn').on('click',goToRegister);
    $('#reg-btn').on('click',registerButtonPressed);
});




//check if the user in already connect (if cookie has UUID)
//parse the cookie according the format:
// Cookie: <name>=<value> [;<name>=<value>]...
//
//example: Cookie: CUSTOMER=WILE_E_COYOTE; PART_NUMBER=ROCKET_LAUNCHER_0001
function checkIfHasCookie()
{
    var cookie = document.cookie;
    var cookieValArr = cookie.split(';');

    for(var i=0; i < cookieValArr.length; i++) {
        var paramsArr = cookieValArr[i].split("=");
        var name = paramsArr[0].replace(' ', '');
        if(name === 'UUID') return true;
    }
    return false;
}

function deleteCookie(key)
{
    // Delete a cookie by setting the date of expiry to yesterday
    var date = new Date();
    date.setDate(date.getDate() -1);
    document.cookie = key+'=;expires=' + date;
    document.location.href = 'welcome.html';
}

//***********************  Login functions ***********************//

// Show register part when clicking on 'register' button and hide Login part
function goToRegister()
{
    var $wrapperLogin = $('#Wrapper-Login'),
        $wrapperRegister = $('#Wrapper-register'),
        $registerUsername = $('#register-UserName');


    $wrapperLogin.hide('blind',1000,function(){
        $wrapperRegister.show('blind',1000);
        $(".form-control").val('');
        $registerUsername.focus();//focus on the user part
    });

    validateInputReg();

}


//when the user press Login button
//this function check if the fields is legal and sending post request to server
function loginButtonPressed()
{
    var $userName = $('#Login-UserName').val(),
        $pass = $('#Login-Password').val();

    if(validateInputLogin($userName,$pass))
    {
		//$.post('http://54.191.164.47:1234/welcome.html',{
        $.post('http://54.191.164.47:1234/users/login',{
                userName: $userName,
                password: $pass
            }, function(data) {
                console.log(data);
                console.log(data.status);
                data = JSON.parse(data);
                var status = data.status;
                if(status == -1) {
                    alert(data.error_msg);
                }
                else {
                    document.location.href = 'mail.html';
                }
        });
    }
    else{
        alert('Username and Password is required and cannot be empty ');
    }
}

//checking if all fields is not empty and not undefined
function validateInputLogin($userName,$pass)
{
    if($userName !== '' && $userName !== undefined && $pass !== '' && $pass !== undefined)
    {
        return true;
    }

    return false;
}

//***********************  Register functions ***********************//

// Show login page when clicking on 'login' button and hide register part
function  goToLogin()
{
    var $wrapperLogin = $('#Wrapper-Login'),
        $wrapperRegister = $('#Wrapper-register'),
        $loginUsername = $('#Login-UserName');

    $wrapperRegister.hide('blind',1000,function(){
        $wrapperLogin.show('blind',1000);
        $(".form-control").val('');
        $loginUsername.focus();//focus on the user part
    });
}


//validating  the input fields on register
//also mark V or X and message near the input box
function validateInputReg(){

    (function($) {
        $.fn.bootstrapValidator.validators.password = {
            validate: function(validator, $field, options) {
                var value = $field.val();
                if (value === '') {
                    return true;
                }

                // Check the password strength
                if (value.length < 8) {
                    return false;
                }

                // The password doesn't contain any uppercase character
                if (value === value.toLowerCase()) {
                    return false;
                }

                // The password doesn't contain any uppercase character
                if (value === value.toUpperCase()) {
                    return false;
                }

                // The password doesn't contain any digit
                if (value.search(/[0-9]/) < 0) {
                    return false;
                }

                return true;
            }
        };
        $.fn.bootstrapValidator.validators.passwordComparator = {
            validate: function(validator, $field, options) {
                var $PasswordCon = $field.val();
                var $Password = $('#register-Password').val();

                if ($PasswordCon === '') {
                    return true;
                }

                // Check if the passwords are equals
                if ($PasswordCon !== $Password ) {
                    return false;
                }

                return true;
            }
        };
    }(window.jQuery));

    $('#registrationForm').bootstrapValidator({
        // To use feedback icons, ensure that you use Bootstrap v3.1.0 or later
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            username: {
                message: 'The username is not valid.',
                validators: {
                    notEmpty: {
                        message: 'The username is required and cannot be empty.'
                    },
                    stringLength: {
                        min: 6,
                        max: 15,
                        message: 'The username must be more than 6 and less than 15 characters long.'
                    },
                    regexp: {
                        regexp: /^[a-zA-Z0-9]+$/,
                        message: 'The username can only consist of alphabetical and number.'
                    },
                    different: {
                        field: 'password',
                        message: 'The username and password cannot be the same as each other.'
                    }
                }
            },

            password: {
                validators: {
                    notEmpty: {
                        message: 'The password is required and cannot be empty.'
                    },
                    different: {
                        field: 'username',
                        message: 'The password cannot be the same as username.'
                    },
                    password: {
                        message: 'The password need to include at least:\n'+
                                 '8 characters, one upper case character, one lower case character and one digit.'
                    }
                }
            },
            passwordCon: {
                validators: {
                    notEmpty: {
                        message: 'The password is required and cannot be empty.'
                    },
                    passwordComparator: {
                        message:  'These passwords don\'t match. Try again?'
                    }
                }
            },
            firstname: {
                message: 'The username is not valid.',
                validators: {
                    notEmpty: {
                        message: 'First name is required and cannot be empty.'
                    },
                    stringLength: {
                        min: 2,
                        max: 10,
                        message: 'First name must be more than 2 and less than 10 characters long.'
                    },
                    regexp: {
                        regexp: /^[a-zA-Z']+$/,
                        message: 'First name can only consist of alphabetical and tag.'
                    }
                }
            },
            lastname: {
                message: 'The username is not valid.',
                validators: {
                    notEmpty: {
                        message: 'Last name is required and cannot be empty.'
                    },
                    stringLength: {
                        min: 2,
                        max: 10,
                        message: 'Last name must be more than 2 and less than 10 characters long.'
                    },
                    regexp: {
                        regexp: /^[a-zA-Z'/]+$/,
                        message: 'Last name can only consist of alphabetical and tag.'
                    }
                }
            },
            age: {
                notEmpty: {
                    message: 'The date of birth is required.'
                },
                regexp: {
                    regexp: /^[0-9/]+$/,
                    message: 'Last name can only consist of alphabetical and \' '
                },
                date: {
                    format: 'MM/DD/YYYY',
                    message: 'The date of birth is not valid.'
                }
            }
        }
    });
    $(function(){$( "#register-Age" ).datepicker()});
}



//when the user press register button
//this function check if the fields is legal and sending post request to server
function registerButtonPressed()
{
    var $userName = $('#register-UserName').val(),
        $pass = $('#register-Password').val(),
        $passCon = $('#register-Password-Con').val(),
        $firstName = $('#register-FirstName').val(),
        $lastName = $('#register-LastName').val(),
        $age = $('#register-Age').val();


    if(checkIfAllFieldsNotEmpty($userName,$pass,$passCon,$firstName,$lastName,$age))
    {
        $age = getYearAge($age);

        //$.post('http://54.191.164.47:1234/users/register',{
        $.post('http://54.191.164.47:1234/users/register',{
            userName: $userName,
            password: $pass,
            firstName: $firstName,
            lastName: $lastName,
            age: $age
        }, function(data) {
            data = JSON.parse(data);
            var status = data.status;
            if(status == -1) {
                alert(data.error_msg);
            }
            else {
                document.location.href = 'mail.html';
            }
        });
    }
}

function getYearAge($age){
    console.log($age);
    var curYear = new Date().getFullYear();
    var yearFromUser = $age.split("/")[2];

    if(curYear < yearFromUser)
    {
        return -1;
    }
    else{
        return curYear - yearFromUser;
    }
}

function checkIfAllFieldsNotEmpty($userName,$pass,$passCon,$firstName,$lastName,$age)
{
    if($userName !== '' && $userName !== undefined && $age !== '' && $age !== undefined &&
       $pass !== '' && $pass !== undefined && $passCon !== '' && $passCon !== undefined &&
       $firstName !== '' && $firstName !== undefined && $lastName !== '' && $lastName !== undefined)
    {}
    else{
        alert('All fields are required and cannot be empty');
        return false;
    }

    if(getYearAge($age) >= 0){
        return true;
    }
    else{
        alert('Your age is incorrect, need to be less than current year');
        return false;
    }


}
