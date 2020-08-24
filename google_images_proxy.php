<?php
header('Content-Type: text/json; charset=utf-8');
/*include('./lib/simple_html_dom.php');
$q = $_GET["q"];

$source = file_get_html("https://google.com/search?q=".$q."&tbm=isch");
echo $source;*/
$q = rawurlencode($_GET["q"]);
$res = file_get_contents("https://www.google.com/search?q=".$q."&tbm=isch");
    if ($res === false) {
        die('error: ' . curl_error($res));
    }
    /*$d = new DOMDocument();
    @$d->loadHTML($res);*/
preg_match_all('/http\:\/\/t[123]\.gstatic\.com\/images\?q=tbn\:[^"]+/', $res, $matches);
echo "";
echo json_encode($matches);

    /*$output = array(
        'title' => '',
        'meta'  => ''
    );

    $x = new DOMXPath($d);

    $title = $x->query("//title");
    if ($title->length > 0) {
        $output['title'] = $title->item(0)->textContent;
    }

    $meta = $x->query("//meta[@name = 'description']");
    if ($meta->length > 0) {
        $output['meta'] = $meta->item(0)->getAttribute('content');
    }

    print_r($output);*/
?>
