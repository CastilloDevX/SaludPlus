class DevelopmentConfig():
    DEBUG = True
    MYSQL_HOST = "localhost"
    MYSQL_USER = "root"
    MYSQL_PASSWORD = "pwd12345"
    MYSQL_DB = "saludplusdb"

config = {
    'development': DevelopmentConfig
}