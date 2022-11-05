import { Box, Button, ButtonGroup, Flex, HStack, IconButton, Input, SkeletonText, Text } from '@chakra-ui/react'
import { FaLocationArrow, FaTimes } from 'react-icons/fa'
import { useJsApiLoader, GoogleMap, Marker, Autocomplete, DirectionsRenderer } from '@react-google-maps/api'
import { useRef, useState } from 'react'
// Starting position
const center = { lat: 43.6607388, lng: -79.3988062 }


function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  })

  const [map, setMap] = useState(/** @type google.maps.Map */ (null))
  const [directionsResponse, setDirectionsResponse] = useState(null)
  // Note: directionsResponse is recorded, but not rendered when we execute the calculateRoute().
  // Needs directionsRenderer is used to render route between destinations
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')

  /** @type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef()
  /** @type React.MutableRefObject<HTMLInputElement> */
  const destiantionRef = useRef()

  // Loading screen
  if (!isLoaded) {
    return <p>Loading...</p>
  }

  // Calculate routes between origin & destination
  async function calculateRoute() {
    if (originRef.current.value === '' || destiantionRef.current.value === '') {
      return
    }
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService()
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destiantionRef.current.value,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
    })
    setDirectionsResponse(results)
    setDistance(results.routes[0].legs[0].distance.text) //TODO secondary: route[0] is fastest, but is it free?
    setDuration(results.routes[0].legs[0].duration.text)
    
    const leg = results.routes[0].legs[0]

    for(let j = 0; j < leg.steps.length; j++){
      let skip = Math.ceil(leg.steps[j].path.length / 5)
      for(let i = 0; i < leg.steps[j].path.length; i+=skip){
        const coords = { 
          lat: leg.steps[j].path[i].lat(),
          lng: leg.steps[j].path[i].lng()
        }
        setMarkersList( (prev) => ([...prev, <Marker position={coords}/>]))

        
        setCircles( (prev) => ([...prev, <Circle center={coords} radius ={5000} 
          options={ {strokeOpacity: 0.3, strokeWeight: 1, fillColor: '#FF0000', strokeColor: '#FF0000', fillOpacity: 0.3}}/>]));
        
      }
    }
  }

  // Clear Route when pressed X button
  function clearRoute() {
    setDirectionsResponse(null)
    setDistance('')
    setDuration('')
    originRef.current.value = ''
    destiantionRef.current.value = ''
  }

  // *******************************************************************************
  // *******************************************************************************
  // Rendering
  // *******************************************************************************
  // *******************************************************************************

  return (
    <Flex position='relative' flexDirection='column' alignItems='center' h='100vh' w='100vw' >
      <Box position='absolute' left={0} top={0} h='100%' w='100%'>
        {/* Google Map Box */}
        <GoogleMap
          center={center}
          zoom={15}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={map => setMap(map)}
        >
          {/* <Marker position={center} /> //Todo: use a loop to display all markers for hotels, attractions, etc. */}
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
        </GoogleMap>
      </Box>

        <Box //The input box from here
          p={4}
          borderRadius='lg'
          m={4}
          bgColor='white'
          shadow='base'
          minW='container.md'
          zIndex='1'
        >
          
          <HStack spacing={2} justifyContent='space-between'>
            <Box flexGrow={1}>
              <Autocomplete>
                <Input type='text' placeholder='Origin' ref={originRef} />
              </Autocomplete>
            </Box>
            <Box flexGrow={1}>
              <Autocomplete>
                <Input type='text' placeholder='Destination' ref={destiantionRef}/>
              </Autocomplete>
            </Box>
  
            <ButtonGroup>
              <Button colorScheme='blue' type='submit' onClick={calculateRoute}>
                Calculate Route
              </Button>
              <IconButton
                aria-label='center back'
                icon={<FaTimes />}
                onClick={clearRoute}
              />
              <IconButton
              aria-label='center back'
              icon={<FaLocationArrow />}
              isRound
              onClick={() => { //KEEP
                map.panTo(center)
                map.setZoom(15)
              }}
            />
            </ButtonGroup>
          </HStack>
          <HStack spacing={4} mt={4} justifyContent='space-between'>
            //distance and duration is being displayed here
{/*             
            <Text>Distance: {distance} </Text>
            <Text>Duration: {duration} </Text> */}
            
          </HStack>
        </Box>
      </Flex>
    )
  }
  
  export default App