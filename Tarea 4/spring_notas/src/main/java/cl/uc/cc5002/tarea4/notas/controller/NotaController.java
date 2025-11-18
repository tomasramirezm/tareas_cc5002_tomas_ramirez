package cl.uc.cc5002.tarea4.notas.controller;

import cl.uc.cc5002.tarea4.notas.model.Nota;
import cl.uc.cc5002.tarea4.notas.repository.NotaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/notas")
@CrossOrigin
public class NotaController {

    private final NotaRepository notaRepository;

    public NotaController(NotaRepository notaRepository) {
        this.notaRepository = notaRepository;
    }

    public static class NuevaNotaRequest {
        private Integer avisoId;
        private Integer nota;

        public Integer getAvisoId() {
            return avisoId;
        }

        public void setAvisoId(Integer avisoId) {
            this.avisoId = avisoId;
        }

        public Integer getNota() {
            return nota;
        }

        public void setNota(Integer nota) {
            this.nota = nota;
        }
    }

    @GetMapping("/promedio/{avisoId}")
    public ResponseEntity<Map<String, Object>> obtenerPromedio(@PathVariable Integer avisoId) {
        Map<String, Object> body = new HashMap<>();
        body.put("ok", true);

        long cantidad = notaRepository.countByAvisoId(avisoId);

        if (cantidad == 0L) {
            body.put("promedio", null);
            body.put("cantidad", 0);
            return ResponseEntity.ok(body);
        }

        Double promedio = notaRepository.findPromedioByAvisoId(avisoId);

        body.put("promedio", promedio);
        body.put("cantidad", (int) cantidad);
        return ResponseEntity.ok(body);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> crearNota(@RequestBody NuevaNotaRequest req) {
        List<String> errores = new ArrayList<>();

        Integer avisoId = req.getAvisoId();
        Integer notaValor = req.getNota();

        if (avisoId == null || avisoId <= 0) {
            errores.add("El ID de aviso es inválido.");
        }
        if (notaValor == null) {
            errores.add("Debe indicar una nota.");
        } else if (notaValor < 1 || notaValor > 7) {
            errores.add("La nota debe ser un número entero entre 1 y 7.");
        }

        if (!errores.isEmpty()) {
            Map<String, Object> bodyError = new HashMap<>();
            bodyError.put("ok", false);
            bodyError.put("errores", errores);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(bodyError);
        }

        Nota n = new Nota(avisoId, notaValor);
        notaRepository.save(n);

        long cantidad = notaRepository.countByAvisoId(avisoId);
        Double promedio = null;
        if (cantidad > 0) {
            promedio = notaRepository.findPromedioByAvisoId(avisoId);
        }

        Map<String, Object> bodyOk = new HashMap<>();
        bodyOk.put("ok", true);
        bodyOk.put("promedio", promedio);
        bodyOk.put("cantidad", (int) cantidad);

        return ResponseEntity.status(HttpStatus.CREATED).body(bodyOk);
    }
}



