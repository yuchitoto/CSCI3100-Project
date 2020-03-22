<?php
Class dbObj{
	/* Database connection start */
	var $servername = "sql12.freesqldatabase.com";
	var $username = "sql12328565";
	var $password = "kQjmPhHsgA";
	var $dbname = "sql12328565";
	var $conn;
	function getConnstring() {
		$conn = mysqli_connect($this->servername, $this->username, $this->password, $this->dbname) or die("Connection failed: " . mysqli_connect_error());

		/* check connection */
		if (mysqli_connect_errno()) {
			printf("Connect failed: %s\n", mysqli_connect_error());
			exit(0);
        } 
        else{
			$this->conn = $conn;
		}
		return $this->conn;
	}
}

?>