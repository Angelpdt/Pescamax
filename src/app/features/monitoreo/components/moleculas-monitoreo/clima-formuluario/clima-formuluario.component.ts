import { Component, Output, EventEmitter, ViewChild, ElementRef  } from '@angular/core';
import { ClimaService } from '../../../services/clima/clima.service';
import { AuthService } from '../../../../../core/services/api-login/auth.service';

@Component({
  selector: 'app-clima-formuluario',
  templateUrl: './clima-formuluario.component.html',
  styleUrls: ['./clima-formuluario.component.css']
})
export class ClimaFormuluarioComponent {
  @ViewChild('cityList') cityList!: ElementRef;

  ciudad: string = '';
  pais: string = 'Co';
  climaData: any;
  userId: string = '';
  currentDate: Date = new Date();
  forecast: any[] = [];
  otherCities: any[] = [
    { name: 'Bogotá', weather: 'Cloudy', temp: 18 },
    { name: 'Medellín', weather: 'Sunny', temp: 25 },
    { name: 'Cali', weather: 'Partly Cloudy', temp: 28 },
    { name: 'Barranquilla', weather: 'Hot', temp: 32 },
    { name: 'Cartagena', weather: 'Sunny', temp: 30 },
  ];
  forecastType: 'today' | 'tomorrow' | 'week' = 'week';

  colombianCities: string[] = [
    'Arauca', 'Armenia', 'Barranquilla', 'Bogotá', 'Bucaramanga', 'Cali', 'Cartagena', 
    'Cúcuta', 'Florencia', 'Ibagué', 'Leticia', 'Manizales', 'Medellín', 'Mitú', 'Mocoa', 
    'Montería', 'Neiva', 'Pasto', 'Pereira', 'Popayán', 'Puerto Carreño', 'Puerto Inírida', 
    'Quibdó', 'Riohacha', 'San Andrés', 'San José del Guaviare', 'Santa Marta', 'Sincelejo', 
    'Tunja', 'Valledupar', 'Villavicencio', 'Yopal'
  ];

  @Output() climaObtenido = new EventEmitter<any>();

  constructor(private climaService: ClimaService, private authService: AuthService) {
    this.userId = this.authService.getUserId();
  }

  buscarCiudad(): void {
    if (this.ciudad.trim() !== '') {
      this.obtenerClima();
    } else {
      console.error('Por favor, seleccione una ciudad para buscar.');
    }
  }

  obtenerClima(): void {
    this.climaService.obtenerClima(this.ciudad, this.pais).subscribe(
      data => {
        this.climaData = data;
        console.log('Clima data:', this.climaData);
        this.climaObtenido.emit(this.climaData);
        this.generarPronostico();
        this.guardarClima();
      },
      error => {
        console.error('Error al obtener el clima:', error);
      }
    );
  }

  guardarClima(): void {
    const clima = {
      NombreCiudad: this.climaData.name,
      TemperaturaActual: this.climaData.main.temp - 273.15,
      EstadoMeteoro: this.climaData.weather[0].main,
      Humedad: this.climaData.main.humidity,
      Nubes: this.climaData.clouds.all,
      UserId: this.userId
    };

    this.climaService.guardarClima(clima).subscribe(
      response => {
        console.log('Clima guardado:', response);
      },
      error => {
        console.error('Error al guardar el clima:', error);
      }
    );
  }

  generarPronostico(): void {
    const dias = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const iconos = ['☀️', '☁️', '🌤️', '🌧️', '❄️', '⛈️', '🌩️'];
    this.forecast = [];
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(this.currentDate);
      fecha.setDate(fecha.getDate() + i);
      this.forecast.push({
        weekday: dias[fecha.getDay()],
        icon: iconos[Math.floor(Math.random() * iconos.length)],
        temperature: Math.round(Math.random() * 20 + 10)
      });
    }
  }

  getFormattedDate(): string {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
    return this.currentDate.toLocaleDateString('en-US', options);
  }

  setForecastType(type: 'today' | 'tomorrow' | 'week'): void {
    this.forecastType = type;
  }

  getForecast(): any[] {
    switch (this.forecastType) {
      case 'today':
        return [this.forecast[0]];
      case 'tomorrow':
        return [this.forecast[1]];
      case 'week':
      default:
        return this.forecast;
    }
  }

  scrollCities(direction: 'left' | 'right'): void {
    const container = this.cityList.nativeElement;
    const scrollAmount = container.clientWidth / 2;
    if (direction === 'left') {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
  }
}