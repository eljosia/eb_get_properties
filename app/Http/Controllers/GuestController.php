<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class GuestController extends Controller
{
    public function index()
    {
        $data = (object)[];
        $data->properties = $this->getProperties();
        return view('pages.guest.index', compact('data'));
    }

    public function getProperties(){
        $client = new \GuzzleHttp\Client();
        $response = $client->request('GET', 'https://api.stagingeb.com/v1/properties', [
            'headers' => [
              'X-Authorization' => config('app.ebkey'),
              'accept' => 'application/json',
            ],
          ]);
        $content = json_decode($response->getBody(), true)['content'];

        return $content;
    }
}
