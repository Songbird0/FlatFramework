<!DOCTYPE html>
<html lang="fr">

<head>


    <title>Flat Framework</title>

    <!-- Meta Data -->
    <meta charset="utf-8">
</head>
<body>
<div id="main">
    @yield('content')
</div>
<script src="@asset('flat.js')"></script>
<script src="@asset('app.js')"></script>
<script src="http://code.jquery.com/jquery-3.2.1.min.js"></script>
</body>
</html>