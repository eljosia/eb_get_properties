$(document).ready(function() {
    function loadProperties() {
        h.getPetition('/api/properties', {}, 'GET')
            .then(response => {
                const properties = response;

                properties.forEach(property => {
                    const type = (property.operations[0]?.type ?? 'sale') === 'sale' ? 'Venta' :
                        'Renta';
                    const bedrooms = property.bedrooms ?? '0';
                    const bathrooms = property.bathrooms ?? '0';
                    const parkingSpaces = property.parking_spaces ?? '0';
                    const location = property.location ?? 'No especificado';
                    const amount = property.operations[0]?.formatted_amount ?? '0';
                    const currency = property.operations[0]?.currency ?? 'USD';
                    const titleImage = property.title_image_full ?? 'placeholder.jpg';

                    const card = $(`
                       <div class="col-12 col-md-4 col-lg-3 mb-10" style="display: none;">
                           <div class="card shadow h-100">
                               <div class="card-header ribbon ribbon-end ribbon-clip">
                                   <div class="ribbon-label">
                                       ${type}
                                       <span class="ribbon-inner bg-info"></span>
                                   </div>
                                   <h3 class="card-title">${property.title}</h3>
                               </div>
                               <img class="mw-100 mh-300px card-rounded-bottom fixed-size"
                                   src="${titleImage}" alt="${property.title}">
                               <div class="card-body">
                                   <div class="row d-flex justify-content-center fs-7 mb-2 text-muted">
                                       <div class="col-3"><i class="fa-solid fa-bed"></i> ${bedrooms}</div>
                                       <div class="col-3"><i class="fa-solid fa-shower"></i> ${bathrooms}</div>
                                       <div class="col-3"><i class="fa-solid fa-car"></i> ${parkingSpaces}</div>
                                   </div>
                                   <div class="row fs-7 mb-2">
                                       <div class="col-1 text-center"><i class="fa-solid fa-location-dot"></i></div>
                                       <div class="col-11">${location}</div>
                                   </div>
                                   <div class="row fs-7 mb-2">
                                       <div class="col-1 text-center"><i class="fa-solid fa-dollar-sign"></i></div>
                                       <div class="col-11">${amount} ${currency}</div>
                                   </div>
                               </div>
                               <div class="card-footer text-center">
                                   <button class="btn btn-light-dark">Información</button>
                               </div>
                           </div>
                       </div>
                   `);

                    $('#property-list').append(card);
                    card.fadeIn(500); // Aparece con un efecto de 500ms
                });
            })
            .catch(err => {
                console.error('Error fetching properties:', err);
            });
    }

    // Llama a la función para cargar propiedades
    loadProperties();
});