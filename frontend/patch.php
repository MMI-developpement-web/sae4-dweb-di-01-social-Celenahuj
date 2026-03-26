<?php
$content = file_get_contents('../backend/src/Controller/PostController.php');
$content = str_replace(
    "'id' => \$post->getId(),\n                    'username' => \$author->getUsername(),",
    "'id' => \$author->getId(),\n                    'username' => \$author->getUsername(),",
    $content
);
file_put_contents('../backend/src/Controller/PostController.php', $content);
