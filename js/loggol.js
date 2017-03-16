var log = (function(){
    //Private variables
    let showLogging = true;
    //Public
    return {
        log: function(value){
            console.log("LOGGOL>>> " + value);
        },
        LoggingEnabled: function(loggingStatus){
            if(typeof(loggingStatus) != bool){
                console.log("LOGGOL_ERROR>>> LoggingEnabled needs to be called with a bool not a " + typeof(loggingStatus));
                return;
        }
            if(loggingStatus){
                showLogging = true;
                console.log("LOGGOL_STATUS>>> Logging Enabled <<<SUTATS_LOGGOL");
            }else{
                showLogging = false;
                console.log("LOGGOL_STATUS>>> Logging Disabled <<<SUTATS_LOGGOL");
            }
        }
    }
}());