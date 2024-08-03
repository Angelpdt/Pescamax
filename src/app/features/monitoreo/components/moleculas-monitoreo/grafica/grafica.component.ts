import { Component, OnInit, Input, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { createChart, IChartApi, ColorType, Time, LineData } from 'lightweight-charts';
import { ApiService, Alerta, Monitoreo } from '../../../services/api-form/api.service';
import { AuthService } from '../../../../../core/services/api-login/auth.service';

interface ChartDataPoint {
  time: Time;
  value: number;
  type: 'temperatura' | 'ph' | 'tds';
}

@Component({
  selector: 'app-grafica',
  templateUrl: './grafica.component.html',
  styleUrls: ['./grafica.component.css']
})
export class GraficaComponent implements OnInit {
  @Input() data: Monitoreo[] = [];
  @Input() selectedLote: number | null = null;
  public chart: IChartApi | null = null;
  public lotes: number[] = [];
  alertas: Alerta[] = [];
  alertasFiltradas: Alerta[] = [];
  mensajeAlerta: string = '';
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  fechaMasAntigua: Date = new Date();
  fechaActual: Date = new Date();
  isMenuOpen: boolean = true;
  monitoreoData: Monitoreo[] = [];

  constructor(
    private apiService: ApiService, 
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.fechaActual.setHours(23, 59, 59, 999);
  }

  ngOnInit(): void {
    this.loadLotes();
    this.cargarAlertas();
    this.obtenerFechaMasAntigua();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['selectedLote']) {
      this.loadDataAndCreateChart();
    }
  }

  obtenerFechaMasAntigua(): void {
    this.apiService.listarMonitoreo(this.authService.getUserId()).subscribe(
      data => {
        if (data.response && data.response.length > 0) {
          this.fechaMasAntigua = new Date(Math.min(...data.response.map(item => new Date(item.FechaHora).getTime())));
        }
      },
      error => {
        console.error('Error al obtener la fecha más antigua:', error);
      }
    );
  }

  loadLotes() {
    this.apiService.listarMonitoreo(this.authService.getUserId()).subscribe(
      data => {
        this.monitoreoData = data.response;
        this.lotes = [...new Set(data.response.map(item => item.LoteID))];
        if (this.lotes.length > 0) {
          this.selectedLote = this.lotes[0];
          this.loadDataAndCreateChart();
        }
      },
      error => {
        console.error('Error al cargar los lotes:', error);
      }
    );
  }

  loadDataAndCreateChart() {
    if (this.data.length === 0) {
      console.log('No hay datos para mostrar');
      return;
    }

    let filteredData = this.data;
    if (this.selectedLote !== null) {
      filteredData = this.data.filter(item => item.LoteID === this.selectedLote);
    }
    if (this.fechaInicio && this.fechaFin) {
      filteredData = filteredData.filter(item => {
        const fecha = new Date(item.FechaHora);
        return fecha >= this.fechaInicio! && fecha <= this.fechaFin!;
      });
    }

    console.log('Datos filtrados:', filteredData);

    const chartData: ChartDataPoint[] = [];
    filteredData.forEach(item => {
      const fecha = new Date(item.FechaHora);
      if (isNaN(fecha.getTime())) {
        console.error('Fecha inválida:', item.FechaHora);
        return;
      }
      const time = this.dateToChartTime(fecha);
      chartData.push(
        { time, value: item.Temperatura, type: 'temperatura' },
        { time, value: item.PH, type: 'ph' },
        { time, value: item.tds, type: 'tds' }
      );
    });

    chartData.sort((a, b) => (a.time as number) - (b.time as number));

    const uniqueChartData = chartData.filter((item, index, self) =>
      index === self.findIndex((t) => t.time === item.time && t.type === item.type)
    );

    console.log('Datos ordenados y únicos:', uniqueChartData);
    
    this.createChart(uniqueChartData);
  }

  dateToChartTime(date: Date): Time {
    return Math.floor(date.getTime() / 1000) as Time;
  }

  createChart(data: ChartDataPoint[]) {
    const chartContainer = document.getElementById('MyChart');
    if (!chartContainer) {
      console.error('No se encontró el elemento con id "MyChart"');
      return;
    }

    if (this.chart) {
      this.chart.remove();
    }

    this.chart = createChart(chartContainer, {
      width: chartContainer.clientWidth,
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: '#1E222D' },
        textColor: '#D9D9D9'
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' }
      },
      rightPriceScale: {
        borderColor: '#2B2B43',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: '#2B2B43',
        timeVisible: true,
        secondsVisible: false
      },
    });

    const temperaturaSeries = this.chart.addAreaSeries({
      lineColor: 'rgba(255, 0, 0, 1)',
      topColor: 'rgba(255, 0, 0, 0.4)',
      bottomColor: 'rgba(255, 0, 0, 0.1)',
      lineWidth: 2,
      title: 'Temperatura'
    });

    const phSeries = this.chart.addAreaSeries({
      lineColor: 'rgba(0, 255, 0, 1)',
      topColor: 'rgba(0, 255, 0, 0.4)',
      bottomColor: 'rgba(0, 255, 0, 0.1)',
      lineWidth: 2,
      title: 'pH'
    });

    const tdsSeries = this.chart.addAreaSeries({
      lineColor: 'rgba(0, 0, 255, 1)',
      topColor: 'rgba(0, 0, 255, 0.4)',
      bottomColor: 'rgba(0, 0, 255, 0.1)',
      lineWidth: 2,
      title: 'TDS',
      crosshairMarkerVisible: true,
      priceFormat: {
        type: 'volume',
        precision: 2,
        minMove: 0.01,
      },
    });

    try {
      temperaturaSeries.setData(data.filter(d => d.type === 'temperatura'));
      phSeries.setData(data.filter(d => d.type === 'ph'));
      tdsSeries.setData(data.filter(d => d.type === 'tds'));

      this.chart.timeScale().fitContent();
    } catch (error) {
      console.error('Error al establecer datos en la gráfica:', error);
    }
  }

  cargarAlertas(): void {
    this.apiService.obtenerAlertas().subscribe({
      next: (alertas) => {
        this.alertas = alertas;
        this.filtrarAlertas();
      },
      error: (error) => console.error('Error al cargar alertas:', error)
    });
  }

  filtrarAlertas(): void {
    if (!this.selectedLote && !this.fechaInicio && !this.fechaFin) {
      this.alertasFiltradas = this.alertas;
      return;
    }

    this.alertasFiltradas = this.alertas.filter(alerta => {
      const perteneceLote = this.selectedLote ? alerta.LoteID === this.selectedLote : true;

      let fechaAlerta: Date | null = null;
      if (alerta.FechaCreacion) {
        fechaAlerta = alerta.FechaCreacion instanceof Date ? alerta.FechaCreacion : new Date(alerta.FechaCreacion);
      }

      const estaEnRango = this.fechaInicio && this.fechaFin && fechaAlerta ?
        (fechaAlerta >= this.fechaInicio && fechaAlerta <= this.fechaFin) : true;

      return perteneceLote && estaEnRango;
    });

    if (this.alertasFiltradas.length === 0) {
      this.mensajeAlerta = "No hay datos disponibles para el rango de fechas y lote seleccionado.";
    } else {
      this.mensajeAlerta = '';
    }
  }

  onDateRangeSelected(event: Event, type: 'start' | 'end'): void {
    const inputElement = event.target as HTMLInputElement;
    const selectedDate = new Date(inputElement.value);
    
    if (type === 'start') {
      this.fechaInicio = selectedDate;
    } else {
      this.fechaFin = selectedDate;
    }

    if (this.fechaInicio && this.fechaFin) {
      this.loadDataAndCreateChart();
      this.filtrarAlertas();
    }
  }

  disableDates = (date: Date): boolean => {
    return date > this.fechaActual || (this.fechaMasAntigua !== null && date < this.fechaMasAntigua);
  };

  onMenuToggle(isOpen: boolean) {
    this.isMenuOpen = isOpen;
  }
}