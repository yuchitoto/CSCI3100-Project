import peewee
from peewee import *

db = MySQLDatabase('sql12328565', user = 'sql12328565', host = 'sql12.freesqldatabase.com', port = 3306, password='kQjmPhHsgA')

class SRC_CODE(Model):
    ID = BigAutoField()
    USER = FixedCharField()
    NAME = FixedCharField()
    SRC = BlobField()
    BLOCK = BlobField()
    class Meta:
        database = db
        table_name = 'SRC_CODE'


class POST(Model):
    ID = BigAutoField()
    USER = FixedCharField()
    CODE = BigIntegerField()
    REPLY = BigIntegerField()
    CONTENT = TextField()
    TITLE = CharField()
    class Meta:
        database = db
        table_name = 'POST'
