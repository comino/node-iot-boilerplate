
var config = {};
var default_env = {};
var default_env_text = "";

function get_env(key, default_value){
    if (!default_env.hasOwnProperty(key)){
        default_env[key] = default_value;
        if (default_env_text!="") default_env_text += "\n";
        default_env_text += key + "=" + default_value;
    }
    if (process.env.hasOwnProperty(key)){
        return process.env[key];
    }
    return default_value;
}

config.DEBUG = get_env("DEBUG", "true")=="true";
config.IS_TEST_SERVER = false;

// HTTP
config.HTTP = {};
config.HTTP.ENABLED = get_env("HTTP_ENABLED", "true")=="true";
config.HTTP.PORT = parseInt(get_env("PORT", '') || get_env("HTTP_PORT", 8000));

// HTTPS
config.HTTPS = {};
config.HTTPS.ENABLED = get_env("HTTPS_ENABLED", "true")=="true";
config.HTTPS.PORT = get_env("HTTPS_PORT", 8001);
config.HTTPS.PRIVATE_KEY_FILE = get_env("HTTPS_PRIVATE_KEY_FILE", './ssl/server.key');
config.HTTPS.CERTIFICATE_FILE = get_env("HTTPS_CERTIFICATE_FILE", './ssl/server.crt');
config.HTTPS.DEVICE_ROOT_CERTIFICATE_FILE = get_env("HTTPS_DEVICE_ROOT_CERTIFICATE_FILE", './ssl/device_root.crt');
config.HTTPS.PRIVATE_KEY = get_env("HTTPS_PRIVATE_KEY", '');
config.HTTPS.CERTIFICATE = get_env("HTTPS_CERTIFICATE", '');
config.HTTPS.DEVICE_ROOT_CERTIFICATE = get_env("HTTPS_DEVICE_ROOT_CERTIFICATE", '');
config.HTTPS.FRAGMENT_SIZE =  get_env("HTTPS_FRAGMENT_SIZE", 1024);

// DATABASES
config.MONGODB = {};
config.MONGODB.URI = get_env("DB_MONGOOSE_URI", 'mongodb://localhost/myProject');
config.MONGODB.POOL_SIZE = parseInt(get_env("DB_MONGOOSE_POOL_SIZE", '5'));

// DEVICE
config.DEVICE = {};
config.DEVICE.LOG_LEVEL = parseInt(get_env("DEVICE_LOG_LEVEL", "1"));
config.DEVICE.AUTHENTICATION_SSL = get_env("DEVICE_AUTHENTICATION_SSL", "false")=="true";
config.DEVICE.AUTHENTICATION_RSA = get_env("DEVICE_AUTHENTICATION_RSA", "false")=="true";
config.DEVICE.AUTHENTICATION_ONE_TIME_KEY = get_env("DEVICE_AUTHENTICATION_ONE_TIME_KEY", "false")=="true";

// SIGNING
config.SIGNING = {};
config.SIGNING.KEY_LENGTH = parseInt(get_env("SIGNING_KEY_LENGTH", '1024'));
config.SIGNING.PRIVATE_KEY_FORMAT = get_env("SIGNING_PRIVATE_KEY_FORMAT", "pkcs1-private-der");
config.SIGNING.PUBLIC_KEY_FORMAT = get_env("SIGNING_PUBLIC_KEY_FORMAT", "pkcs8-public-pem");
config.SIGNING.MESSAGE_ENCODING = get_env("SIGNING_MESSAGE_ENCODING", "utf8");
config.SIGNING.SIGNATURE_ENCODING = get_env("SIGNING_SIGNATURE_ENCODING", "base64");


config.MAILER = {};
config.MAILER.host = get_env("MAILER_HOST","smtp.mydomain.com");
config.MAILER.port = get_env("MAILER_PORT", 587);
config.MAILER.auth = {};
config.MAILER.auth.user = get_env("MAILER_EMAIL_ID", "info@mydomain.com" );
config.MAILER.auth.pass = get_env("MAILER_PASSWORD", "mycrappyPassword123") ;


module.exports = config;
