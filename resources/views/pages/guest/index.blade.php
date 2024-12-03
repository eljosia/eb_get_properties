 @extends('layout.master')
 @section('content')
     <nav class="navbar navbar-expand-lg bg-white shadow">
         <div class="container-fluid">
             <a class="navbar-brand mx-auto" href="#">
                 <img src="https://cdn-viterbit-careers-site.viterbit.com/t-wmhd7aqkw/646e4891f1a8d533153094.png"
                     width="60px"></a>
         </div>
     </nav>

     <div class="container-fluid mt-10">
         <div class="h1 p-10 text-center">Lista de Propiedades</div>
         <div id="property-list" class="row"></div>
     </div>

     @push('scripts')
         <script src="{{ mix('js/properties.js') }}"></script>
     @endpush
 @endsection
