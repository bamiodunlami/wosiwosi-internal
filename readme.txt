# Each user have their directory, admin, staff and influencer
# General directory handles miscellanous routes and functions (general.controller, general.router and other frond end diroctory)
#front end Order pages that both admin and staff access together such as order to process, single-order-processing-page are all handled in general-order dirctory/files
#note saving is handled under general-order directory/files
#when staff click on singleOrderProcessing, the order locks by sending to database
#the reason for database for order is to safe parmanently what pickers and packers did. When pickers or packers click on each order available to process, the order number, order status, notes and other parameters are seve into the database.
