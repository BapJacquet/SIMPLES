<?php
$mysqli = new mysqli("localhost", "sioux", "sioux", "simples");

printf("Initial character set: %s\n", $mysqli->character_set_name());

if (!$mysqli->set_charset('utf8')) {
    printf("Error loading character set utf8: %s\n", $mysqli->error);
    exit;
}

echo "New character set information:\n";
print_r( $mysqli->get_charset() );

?>
