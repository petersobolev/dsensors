@echo BUILDING CLIENT...
@cd client
@call npm run build
@cd ..
@echo COPYING BUILT CLIENT TO SERVER PUBLIC/ SUBDIRECTORY....
@xcopy .\client\dist\ .\server\public  /h /i /c /k /e /r /y